class Method_app{
	/**
	 *
	 * @param {*} extendCls 最终继承类
	 */
	async login(params){
		const res =  await this.$http.post('/his/index.login',params)
		console.log(res)
		return res
	}
}

export default Method_app
