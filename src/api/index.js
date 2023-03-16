import { mixinsClass } from '@/utils/mixinsClass'
const apiFiles = import.meta.glob('./**/*.js',{eager:true})
console.log("-> %c apiFiles  === %o", "font-size: 15px;color: green;", apiFiles)
const methodsList = new Set([])
const env = import.meta.env.VITE_APP_NODE_ENV

for ( const apiPath in apiFiles ) {
	console.log("-> %c apiPath  === %o", "font-size: 15px;color: green;", apiFiles[apiPath].default)
	methodsList.add(apiFiles[apiPath].default)
}
// 	console.log("-> %c apiList  === %o", "font-size: 15px;color: green;", apiList)
class API extends mixinsClass(...methodsList) {
	constructor(http) {
		super()
		this.$http = http
	}
}

export default API
