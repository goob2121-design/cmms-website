import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("presale access endpoint uses the existing StageFlow public show endpoint", () => {
  const helper = readFileSync("lib/presale-access.ts", "utf8");
  const route = readFileSync("app/api/presale-access/[slug]/route.ts", "utf8");

  assert.match(helper, /TICKET_SALES_STATUS_ENDPOINT/);
  assert.match(helper, /\/api\/public\/shows\/\$\{encodeURIComponent\(\s*showSlug,\s*\)\}\/presale-access/);
  assert.match(route, /getPresaleAccessEndpoint\(slug\)/);
});

test("presale browser marker is show-specific and non-sensitive", () => {
  const helper = readFileSync("lib/presale-access.ts", "utf8");
  const component = readFileSync("components/PresaleAccessGate.tsx", "utf8");

  assert.match(helper, /PRESALE_ACCESS_STORAGE_PREFIX = "cmms_presale_access_"/);
  assert.match(helper, /`\$\{PRESALE_ACCESS_STORAGE_PREFIX\}\$\{showSlug\}`/);
  assert.match(component, /getPresaleAccessStorageKey\(showSlug\)/);
  assert.doesNotMatch(component, /localStorage\.setItem\([^)]*ticketUrl/i);
});

test("presale access markers parse safely and expire", () => {
  const helper = readFileSync("lib/presale-access.ts", "utf8");
  const component = readFileSync("components/PresaleAccessGate.tsx", "utf8");

  assert.match(helper, /marker\?\.granted/);
  assert.match(helper, /Date\.parse\(marker\.expiresAt\)/);
  assert.match(helper, /now\.getTime\(\) < expiresAt/);
  assert.match(helper, /JSON\.parse\(value\)/);
  assert.match(component, /expiresAt: publicSaleStartsAt/);
});

test("presale gate validates server-side, stores no raw code, and redirects only after success", () => {
  const component = readFileSync("components/PresaleAccessGate.tsx", "utf8");
  const route = readFileSync("app/api/presale-access/[slug]/route.ts", "utf8");

  assert.match(component, /fetch\([\s\S]*`\/api\/presale-access\/\$\{encodeURIComponent\(showSlug\)\}`/);
  assert.match(route, /getPresaleAccessEndpoint\(slug\)/);
  assert.match(component, /localStorage\.setItem\(storageKey, JSON\.stringify\(marker\)\)/);
  assert.match(component, /window\.location\.assign\(result\.ticketUrl\)/);
  assert.match(component, /disabled=\{isChecking\}/);
  assert.match(component, /if \(isChecking\)[\s\S]*return;/);
  assert.match(component, /That presale code wasn't recognized/);
  assert.match(component, /We couldn't verify the presale code right now/);
  assert.match(component, /href="\/mailing-list"/);
  assert.doesNotMatch(component, /localStorage\.setItem\([^)]*code/i);
  assert.doesNotMatch(component, /console\.(log|warn|error)\([^)]*code/i);
});

test("dedicated presale page renders the access-code gate", () => {
  const page = readFileSync("app/presale/page.tsx", "utf8");
  const component = readFileSync("components/PresaleAccessGate.tsx", "utf8");

  assert.match(page, /<PresaleAccessGate/);
  assert.match(page, /showSlug=\{stageFlowShow\.slug\}/);
  assert.match(page, /Already received your presale email\?/);
  assert.match(component, /Already Have Your Presale Code\?/);
  assert.match(component, /Presale Access Code/);
  assert.match(component, /Continue to Tickets/);
});

test("shared TicketSaleGate routes presale CTAs to Presale without showing the code form", () => {
  const gate = readFileSync("components/TicketSaleGate.tsx", "utf8");
  const homepage = readFileSync("app/page.tsx", "utf8");
  const showDatesPage = readFileSync("app/show-dates/page.tsx", "utf8");
  const showDetailsPage = readFileSync("app/show-dates/[slug]/page.tsx", "utf8");

  assert.doesNotMatch(gate, /<PresaleAccessGate/);
  assert.match(gate, /if \(showsPresalePromotion && presaleHref\)/);
  assert.match(gate, /<ClearPresaleAccessMarker showSlug=\{show\.slug\} \/>/);
  assert.match(gate, /if \(resolvedAvailability\.kind === "public"\)[\s\S]*\{children\}/);
  assert.match(homepage, /<TicketSaleGate show=\{\{ slug: show\.slug/);
  assert.match(homepage, /presaleHref="\/presale" compact/);
  assert.match(showDatesPage, /<TicketSaleGate show=\{\{ slug: event\.slug[\s\S]*presaleHref="\/presale"/);
  assert.match(showDetailsPage, /<TicketSaleGate show=\{\{ slug: show\.slug[\s\S]*presaleHref="\/presale"/);
  assert.doesNotMatch(homepage, /Presale Access Code|Continue to Tickets|That presale code wasn't recognized/);
});
