import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  fetchRecentYouTubeVideos,
  getHomepageYouTubeVideos,
  parseYouTubeFeed,
  selectDailyYouTubeVideo,
} from "../lib/youtube-feed.ts";

const homepage = readFileSync("app/page.tsx", "utf8");
const player = readFileSync("components/FeaturedYouTubeVideo.tsx", "utf8");
const config = readFileSync("lib/featured-video.ts", "utf8");

const sampleFeed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
  <entry><yt:videoId>older1</yt:videoId><title>Older &amp; Good</title><published>2026-09-08T12:00:00Z</published></entry>
  <entry><yt:videoId>newest</yt:videoId><title>Newest Show</title><published>2026-09-10T12:00:00Z</published></entry>
  <entry><yt:videoId>older2</yt:videoId><title>Second Older</title><published>2026-09-07T12:00:00Z</published></entry>
  <entry><yt:videoId>older3</yt:videoId><title>Third Older</title><published>2026-09-06T12:00:00Z</published></entry>
  <entry><yt:videoId>too-old</yt:videoId><title>Not Displayed</title><published>2026-09-05T12:00:00Z</published></entry>
</feed>`;

test("single featured video stays integrated into the upper hero", () => {
  const heroStartIndex = homepage.indexOf(
    "<section className=\"relative isolate min-h-[88svh]",
  );
  const videoIndex = homepage.indexOf("<FeaturedYouTubeVideo");
  const videoEndIndex = homepage.indexOf("</FeaturedYouTubeVideo>", videoIndex);
  const sponsorIndex = homepage.lastIndexOf("<HomepageSponsorStrip");
  const aboutSectionIndex = homepage.indexOf(
    '<section className="border-y border-[#d7a84f]/12',
  );

  assert.ok(heroStartIndex >= 0 && heroStartIndex < videoIndex);
  assert.ok(videoIndex < videoEndIndex && videoEndIndex < sponsorIndex);
  assert.ok(sponsorIndex < aboutSectionIndex);
  assert.match(
    homepage,
    /<\/FeaturedYouTubeVideo>[\s\S]*<HomepageSponsorStrip sponsors=\{homepageSponsors\} \/>[\s\S]*<\/section>/,
  );
  assert.match(player, /lg:grid-cols-\[minmax\(0,11fr\)_minmax\(320px,9fr\)\]/);
  assert.match(player, /<div className="min-w-0">\{children\}<\/div>/);
  assert.match(player, /Watch CMMS/);
  assert.match(player, /More Videos on YouTube/);
  assert.match(homepage, /min-h-\[88svh\].*lg:min-h-\[100svh\]/);
  assert.match(homepage, /lg:items-center lg:pb-10/);
  assert.match(player, /rounded-full bg-\[#d7a84f\]/);
  assert.match(homepage, /flex w-full flex-col items-center text-center/);
  assert.doesNotMatch(homepage, /lg:items-start lg:text-left/);
});

test("feed mapping sorts newest first and keeps four videos in the rotation pool", () => {
  const videos = parseYouTubeFeed(sampleFeed);

  assert.equal(videos.length, 4);
  assert.deepEqual(
    videos.map((video) => video.id),
    ["newest", "older1", "older2", "older3"],
  );
  assert.match(videos[0].thumbnailUrl, /newest\/hqdefault\.jpg/);
});

test("daily selection is deterministic and rotates through the recent pool", () => {
  const videos = parseYouTubeFeed(sampleFeed);
  const firstVisit = selectDailyYouTubeVideo(
    videos,
    "manual",
    new Date("2026-09-10T08:00:00Z"),
  );
  const sameDayVisit = selectDailyYouTubeVideo(
    videos,
    "manual",
    new Date("2026-09-10T22:00:00Z"),
  );
  const nextDayVisit = selectDailyYouTubeVideo(
    videos,
    "manual",
    new Date("2026-09-11T08:00:00Z"),
  );

  assert.equal(firstVisit?.id, sameDayVisit?.id);
  assert.notEqual(firstVisit?.id, nextDayVisit?.id);
  assert.ok(videos.some((video) => video.id === firstVisit?.id));
  assert.ok(videos.some((video) => video.id === nextDayVisit?.id));
});

test("feed failures are graceful and manual video remains the fallback", async () => {
  const failed = await fetchRecentYouTubeVideos(
    "UC-example",
    3600,
    (async () => new Response("Unavailable", { status: 503 })) as typeof fetch,
  );
  const fallback = selectDailyYouTubeVideo(failed, "manual-video-id");

  assert.deepEqual(failed, []);
  assert.equal(fallback?.id, "manual-video-id");
  assert.equal(getHomepageYouTubeVideos([], "").length, 0);
  assert.equal(selectDailyYouTubeVideo([], ""), null);
});

test("player renders no gallery and creates only one iframe after Play", () => {
  assert.match(player, /useState\(false\)/);
  assert.match(player, /onClick=\{\(\) => setIsPlaying\(true\)\}/);
  assert.match(player, /isPlaying \? \(/);
  assert.match(player, /youtube-nocookie\.com\/embed/);
  assert.match(player, /loading="lazy"/);
  assert.match(player, /aspect-video w-full/);
  assert.equal((player.match(/<iframe/g) ?? []).length, 1);
  assert.doesNotMatch(player, /selectionVideos|\.map\(|setSelectedVideoId/);
  assert.doesNotMatch(player, /autoPlay/);
});

test("mobile source order is show information then one featured video", () => {
  const showContentIndex = player.indexOf("{children}");
  const videoCardIndex = player.indexOf("{!video ? (");

  assert.ok(showContentIndex >= 0 && showContentIndex < videoCardIndex);
  assert.match(player, /grid items-center gap-7 lg:grid-cols/);
  assert.doesNotMatch(player, /sm:grid-cols-3|overflow-x/);
});

test("channel feed remains server-fetched hourly without an API key", () => {
  assert.match(
    config,
    /CMMS_YOUTUBE_CHANNEL_ID = "UC2N6VWwTD7eooxtHxBTJ8GA"/,
  );
  assert.match(config, /YOUTUBE_FEED_REVALIDATE_SECONDS = 3600/);
  assert.match(
    config,
    /FEATURED_YOUTUBE_VIDEO_ID = "D-nUxAKw7Es"/,
  );
  assert.match(homepage, /fetchRecentYouTubeVideos/);
  assert.match(homepage, /selectDailyYouTubeVideo/);
  assert.doesNotMatch(config, /API_KEY/);
});

test("homepage keeps the corrected ticker phrase", () => {
  assert.match(homepage, /Advance Tickets Are On Sale Now!/);
  assert.match(homepage, /ticker\.message\.replace/);
});