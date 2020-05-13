// // const webpack = require('webpack')
// // module.exports = {
// //     chainWebpack: config => {

// //         config
// //             .plugin('vue-cli-plugin-electron-builder')
// //             .use(webpack.DefinePlugin, [
// //                 {
// //                     'process.env.FLUENTFFMPEG_COV': false
// //                 }
// //             ])
// //         return config
// //     }
// // }

// // electron builder config
// // module.exports = {
// //     pluginOptions: {
// //         electronBuilder: {
// //             builderOptions: {
// //                 // options placed here will be merged with default configuration and passed to electron-builder
                
// //                 chainWebpackRendererProcess: config => {
// //                     // Chain webpack config for electron renderer process only
// //                     // The following example will set asar to true in your app
// //                     config.plugin('define').tap(args => {
// //                       args[0]['asar'] = false
// //                       return args
// //                     })

// //                     return config
// //                   }
// //             }
// //         }
// //     }
// // }

// module.exports = {
//     configureWebpack: {
//       // Configuration applied to all builds
//     },
//     pluginOptions: {
//       electronBuilder: {
//         // List native deps here if they don't work
//         externals: ['my-native-dep'],
//         // If you are using Yarn Workspaces, you may have multiple node_modules folders
//         // List them all here so that VCP Electron Builder can find them
//         nodeModulesPath: ['../../node_modules', './node_modules'],
//         asar:false

        
//         // chainWebpackMainProcess: config => {
//         //   // Chain webpack config for electron main process only
//         // },
//         // chainWebpackRendererProcess: config => {
//         //   // Chain webpack config for electron renderer process only
//         //   // The following example will set IS_ELECTRON to true in your app
//         //   console.log(config.plugin(''))
//         //   config.plugin('define').tap(args => {
//         //     args[0]['asar'] = true
//         //     return args
//         //   })
//         // },
//         // // // Use this to change the entrypoint of your app's main process
//         // // mainProcessFile: 'src/myBackgroundFile.js',
//         // // // Provide an array of files that, when changed, will recompile the main process and restart Electron
//         // // // Your main process file will be added by default
//         // // mainProcessWatch: ['src/myFile1', 'src/myFile2'],
//         // // // [1.0.0-rc.4+] Provide a list of arguments that Electron will be launched with during "electron:serve",
//         // // // which can be accessed from the main process (src/background.js).
//         // // // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
//         // // // Command line args (excluding --debug, --dashboard, and --headless) are passed to Electron as well
//         // // mainProcessArgs: ['--arg-name', 'arg-value']
//       }
//     }
//   }