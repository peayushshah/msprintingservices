# MS TEXTILE Storefront and Admin Panel

## Open in Visual Studio Code

1. Extract `ms-textile-admin-panel.zip`.
2. In Visual Studio Code, choose **File → Open Folder...** and select the extracted `ms-textile-admin-panel` folder. You can also open `ms-textile-admin-panel.code-workspace`.
3. Open `admin.html` to manage the storefront or `index.html` to view it.
4. On first opening the admin panel, create a password with at least 8 characters. The password is kept in this browser and must be entered every time the admin page is opened or refreshed. Logging out locks the panel again. Use a local web server such as the VS Code Live Server extension if the browser does not support password setup from a `file://` address.

## Admin features

Edit storefront copy, collection cards, products, optional prices and currency, contact details, and theme colours. Add custom storefront sections with text, a device-uploaded image and an optional button. Main, collection, product, story and custom section photos can be selected from your device; uploads are resized and converted in the browser.

The browser-only password gate and all settings are local to this browser. This does not sync edits to a hosted site or other visitors, and it is not server-side security. Shared publishing and production authentication require connecting the panel to server storage and authentication.

