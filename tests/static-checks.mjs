import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const sql = fs.readFileSync("supabase.sql", "utf8");

assert.match(html, /Oportunidades Próximas/);
assert.match(html, /dashboardView/);
assert.match(html, /wizardView/);
assert.match(html, /consumerView/);

assert.match(js, /ANDROID_AUTO_ENABLED = Boolean\(config\.androidAutoEnabled\)/);
assert.match(js, /androidAutoPoiPublished: false/);
assert.match(js, /mainStatus: "in_review"/);
assert.match(js, /validateLink/);
assert.match(js, /matchingConsumerAlerts/);
assert.match(js, /draft\.validUntil < draft\.validFrom/);

assert.match(css, /app-shell/);
assert.match(css, /wizard-shell/);
assert.match(css, /consumer-shell/);

assert.match(sql, /benefit_alerts/);
assert.match(sql, /android_auto_poi_published = false/);
assert.match(sql, /consumer_no_background_location/);
assert.match(sql, /opportunity_history/);

console.log("static-checks ok");
