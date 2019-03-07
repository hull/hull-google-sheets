# Hull Google Sheets Importer

## Developing

- Fork
- Install

```sh
yarn
yarn run start:dev # starts in dev mode with nodemon
```

### Quick start on AppScript

Most of the import logic and data formatting is running inside of the Google Sheet itelf as a set of AppScript functions.

Developing on the connector happens mostly in Google's script editor, working on the `app-script/Code.gs`.


You can follow this QuickStart on Google developers doc to setup a new Google Sheet for development :

https://developers.google.com/gsuite/add-ons/editors/docs/quickstart/translate

Google developers Add-ons documentation is also a good starting point to understand the development environment and resources on the AppScript APIs for Google Sheets :

https://developers.google.com/gsuite/add-ons/overview

### Connector UI

The UI exposed by the connector is implemented as a React app loaded in the Sidebar.
The client side assets are referenced by the `app-script/Sidebar.html` layout but served by the connector itself.

The development flow is very similar to any other connector.


### Connector server and UI

The connector also has a server side component that exposes ther following endpoints :

- `/schema/fields` exposes the list available attributes in the Organization. It is used in the UI to populate the select options in the columns mapper.

- `/import` is hit by the AppScript `importRange` method to perform the actual data import.


### Local development flow

It involves :

- run the connector locally
- paste the content of the `app-script` folder in the script editor section of a new Google Sheet
- change the addres of the static assets `sourceUrl` in the Code.gs file to point to your local server (need to find a way to make this more seamless

Committing changes :

- Report the changes on the `Code.gs` and `Sidebar.html` files before committing change

## Deploying

If the changes only involves the Connector's Server side code and/or UI, then it's the same flow as other connectors.

If there are changes on the AppScript code, then you need to publish a new version of the add-on on the Google Marketplace.

- Connect as accounts@hull.io and go to https://script.google.com
- Open the project called `Hull Sheets importer`
- Report the changes to the `app-script` files in the script editor
- Follow the publication insrtuctions described here https://developers.google.com/gsuite/add-ons/how-tos/manage-addons in the section called `Update your editor add-on`
