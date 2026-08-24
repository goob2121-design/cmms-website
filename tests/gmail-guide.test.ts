import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const guide = readFileSync("components/GmailGuide.tsx", "utf8");
const presale = readFileSync("app/presale/page.tsx", "utf8");
const mailingList = readFileSync("app/mailing-list/page.tsx", "utf8");
const homepage = readFileSync("app/page.tsx", "utf8");

test("provided Gmail guide asset exists and is shared by both public pages", () => {
  assert.equal(existsSync("public/images/emailstuff.png"), true);
  assert.match(presale, /<GmailGuide variant="presale" \/>/);
  assert.match(mailingList, /<GmailGuide variant="mailingList" \/>/);
  assert.doesNotMatch(homepage, /GmailGuide|emailstuff\.png/);
});

test("guide has useful alt text and responsive uncropped rendering", () => {
  assert.match(
    guide,
    /How to find a CMMS presale email in Gmail Promotions and move future CMMS emails to Primary/,
  );
  assert.match(guide, /width=\{1731\}/);
  assert.match(guide, /height=\{909\}/);
  assert.match(guide, /h-auto w-full object-contain/);
  assert.doesNotMatch(guide, /object-cover|fill/);
  assert.match(guide, /href="\/images\/emailstuff\.png"/);
});

test("guide retains compact Gmail text guidance", () => {
  assert.match(
    guide,
    /Gmail may place CMMS Early Access emails in the Promotions tab/,
  );
  assert.match(guide, /A Quick Tip for Gmail Users/);
});
test("presale offers a Gmail link that scrolls to the guide", () => {
  assert.match(presale, /href="#gmail-help"/);
  assert.match(presale, /Using Gmail\?/);
  assert.match(
    guide,
    /id=\{variant === "presale" \? "gmail-help" : undefined\}/,
  );
  assert.match(guide, /scroll-mt-28/);
});
