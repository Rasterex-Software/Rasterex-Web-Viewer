# Getting Started with Overlay Comparison Demo

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Replace the version of `@foxitsoftware/foxit-pdf-sdk-for-web-library-full`

For the convenience of running the example, the `@foxitsoftware/foxit-pdf-sdk-for-web-library-full` version configured by default in package.json uses a relative path. If you want to use another version, please replace the path with the version number directly ( Note: the version number must not be lower than 9.0.0):

```json
{
    "@foxitsoftware/foxit-pdf-sdk-for-web-library-full": "^9.0.0"
}
```

## Learn More

You can learn more about overlay comparison in the [FoxitPDFSDKForWeb Developer Guide Documentation](https://webviewer-demo.foxit.com/docs/developer-guide/main/features/overlay-comparison.html);
