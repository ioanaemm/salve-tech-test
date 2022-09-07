const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@font-size-base": "13px",
              "@primary-color": "#8166DC",
              "@border-radius-base": "8px",
              "@border-color-base": "#f0f0f0",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
