import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const sql = fs.readFileSync("supabase.sql", "utf8");
const vercel = fs.readFileSync("vercel.json", "utf8");

assert.match(html, /Oportunidades Próximas/);
assert.match(html, /dashboardView/);
assert.match(html, /wizardView/);
assert.match(html, /consumerAppView/);
assert.match(html, /consumerView/);
assert.doesNotMatch(html, /data-route="consumer">Vitrine do consumidor/);
assert.doesNotMatch(html, /currentPlaceSelect/);

assert.match(js, /ANDROID_AUTO_ENABLED = Boolean\(config\.androidAutoEnabled\)/);
assert.match(js, /androidAutoPoiPublished: false/);
assert.match(js, /mainStatus: "in_review"/);
assert.match(js, /validateLink/);
assert.match(js, /matchingConsumerAlerts/);
assert.match(js, /draft\.validUntil < draft\.validFrom/);
assert.match(js, /consumerAppView/);
assert.match(js, /sidebar-collapsed/);
assert.match(js, /dashboardPlaceSelect/);
assert.match(js, /select-dashboard-place/);
assert.match(js, /googleBusinessProfile/);
assert.match(js, /connect-google-business/);
assert.match(js, /simulate-no-business-profile/);
assert.match(js, /select-google-location/);
assert.match(js, /Google Business Profile/);
assert.match(js, /startGoogleOAuth/);
assert.match(js, /handleGoogleOAuthCallback/);
assert.match(js, /https:\/\/www\.googleapis\.com\/auth\/business\.manage/);
assert.match(js, /oauth_code_received/);

assert.match(css, /app-shell/);
assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
assert.match(css, /wizard-shell/);
assert.match(css, /consumer-shell/);
assert.match(css, /consumer-app-shell/);
assert.match(css, /sidebar-collapsed/);
assert.match(css, /overflow-wrap: anywhere/);

assert.match(sql, /benefit_alerts/);
assert.match(sql, /android_auto_poi_published = false/);
assert.match(sql, /consumer_no_background_location/);
assert.match(sql, /opportunity_history/);
assert.match(vercel, /\/auth\/callback/);

console.log("static-checks ok");
