// const configFiles = require.context('./', true, /\.js$/)
// const configs = configFiles.keys().reduce((configs, configPath) => {
// /
// 	if (fileName == 'index') {
// 		return configs
// 	}
// 	const value = configFiles(configPath)
// 	configs[fileName] = value
// 	return configs
// }, {})
const configFiles = import.meta.glob('./**/*.js',{eager:true})
const configMap = new Map()
const env = import.meta.env.VITE_APP_NODE_ENV

for ( const configPath in configFiles ) {
  const fileName = configPath.replace(/(\.\/|\.js)/g, '')
  configMap.set(fileName,configFiles[configPath].default)
}
export default configMap.get(`index.${env}`)
