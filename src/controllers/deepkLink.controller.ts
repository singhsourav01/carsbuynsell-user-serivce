import { asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { exec } from "child_process";
export class DeepLinkController {
  appleAppAssociation = asyncHandler(async (req: Request, res: Response) => {
    res.json({
      applinks: {
        apps: [],
        details: [
          {
            appID: "3BKVMGXB9C.com.dream-catchers.app", // Replace with your iOS app ID
            paths: ["/link/*"],
          },
        ],
      },
    });
  });

  assetLink = asyncHandler(async (req: Request, res: Response) => {
    res.json([
      {
        "relation": [
          "delegate_permission/common.handle_all_urls",
          "delegate_permission/common.get_login_creds"
        ],
        "target": {
          "namespace": "android_app",
          "package_name": "com.dreamcatchers123.app",
          "sha256_cert_fingerprints": [
            "63:DE:DC:C4:A9:42:E3:28:85:C1:38:E9:7E:49:6C:4A:01:40:37:E9:40:8F:A9:92:FE:00:DB:93:F3:29:76:28"
          ]
        }
      },
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.dreamcatchers123.app",
          sha256_cert_fingerprints: [
            "F4:9B:A6:60:BE:3C:34:58:6E:A8:C7:F1:53:25:39:86:AB:40:B2:90:54:9F:E1:60:D3:4A:33:77:54:E4:63:C7", // Replace with your app's SHA-256 fingerprint
          ],
        },
      },
    ]);
  });
  Link = asyncHandler(async (req: Request, res: Response) => {
    const path = req.path.replace("/link/", "");
    console.log("Received path:", path);
    const userAgent = req.headers["user-agent"] || "";
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    let deepLinkUrl = "";
    if (path.startsWith("search-option-view/")) {
      console.log("Received path:", "1");
      const productId = path.split("/")[1];
      deepLinkUrl = `yourapp://user/search-option-view/${productId}`;
    } else {
      console.log("Received path:", "2");
      deepLinkUrl = `yourapp://${path}`;
    }

    if (process.env.NODE_ENV === "production") {
      const APP_STORE_URL =
        "https://apps.apple.com/us/app/dream-catchers-talents/id6636545334?platform=iphone";
      const PLAY_STORE_URL =
        "https://play.google.com/store/apps/details?id=com.dreamcatchers123.app&pli=1";
      const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
          ${
            isIOS
              ? `
            <meta http-equiv="refresh" content="2;url=${APP_STORE_URL}">
            <!-- iOS app store fallback -->
            <meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-argument=${deepLinkUrl}">
          `
              : `
            <meta http-equiv="refresh" content="2;url=${PLAY_STORE_URL}">
          `
          }
          <script>
            // Try to open the app first
            window.location.href = "${deepLinkUrl}";
            
            // Set a timeout to redirect to store if app doesn't open
            setTimeout(function() {
              window.location.href = "${
                isIOS ? APP_STORE_URL : PLAY_STORE_URL
              }";
            }, 2000);
          </script>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            .loader {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="loader"></div>
            <p>Opening Dream Catchers app...</p>
            <p style="font-size: 14px; color: #666;">
              If the app doesn't open automatically, you'll be redirected to the ${
                isIOS ? "App Store" : "Play Store"
              }.
            </p>
          </div>
        </body>
      </html>
    `;
      return res.send(htmlResponse);
    } else if (isIOS) {
      // Handle iOS redirection

      // For iOS, we redirect to the custom URL scheme
      exec(
        `xcrun simctl openurl booted "${deepLinkUrl}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error: ${error}`);
            res.status(500).send("Error triggering deep link");
            return;
          }
          res.send("Deep link triggered for iOS");
        }
      );
    } else {
      const adbCommand = `adb shell am start -W -a android.intent.action.VIEW -d "${deepLinkUrl}"`;

      exec(adbCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error}`);
          res.status(500).send("Error triggering deep link");
          return;
        }
        res.send("Deep link triggered");
      });
    }
  });
}
