# Getting Started with Integrate-Service-Worker Demo

The "integrate-service-worker" sample demonstrates a simple example of how to integrate the SDK's built-in service worker with the application layer service worker. This example highlights a basic implementation of service worker integration to facilitate offline functionality in your application.

## Installation

Navigate into the sample directory and install dependencies using yarn:

```sh
yarn install
```

## Running the Sample

1. Start the development server:

    ```bash
    yarn start
    ```

1. Open your browser and visit <http://127.0.0.1:9899> to view the sample.

## Build the Sample

Build production code:

```bash
yarn build
```

The built code will be generated in the `dist` directory.

## Notes

- This sample requires a browser that supports Service Workers
- This is a simplified example and may need adjustments for real-world applications.
- If you encouter any issues, please refer to the webpack documentation or seek help.

## Other

- This sample showcases a basic integration approach and you can expand and modify it according to your specific needs.
- For more infomation about Service Workers, please refer to the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).
