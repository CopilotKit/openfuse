// Lets the app talk to a MyMuse server running on the same machine.
//
// Android blocks cleartext HTTP for apps targeting API 28 and newer, and iOS
// blocks it through App Transport Security. Production traffic stays HTTPS;
// only the local hosts used by a self-hosted server (the emulator's host
// loopback, the simulator, and the desktop app) are allowed to use plain HTTP.
//
// Remove this plugin once every workspace is served over HTTPS.
const fs = require("node:fs");
const path = require("node:path");
const { withAndroidManifest, withDangerousMod, withInfoPlist } = require("expo/config-plugins");

const LOCAL_HOSTS = ["10.0.2.2", "127.0.0.1", "localhost"];

const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config cleartextTrafficPermitted="true">
${LOCAL_HOSTS.map((host) => `    <domain includeSubdomains="false">${host}</domain>`).join("\n")}
  </domain-config>
</network-security-config>
`;

module.exports = function withLocalHttp(config) {
  config = withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (application) {
      application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    }
    return cfg;
  });

  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, "app/src/main/res/xml");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "network_security_config.xml"), networkSecurityConfig);
      return cfg;
    },
  ]);

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSAppTransportSecurity = {
      ...(cfg.modResults.NSAppTransportSecurity || {}),
      NSAllowsLocalNetworking: true,
    };
    return cfg;
  });

  return config;
};
