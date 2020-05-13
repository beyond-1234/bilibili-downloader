var store = {
    debug: true,
    state: {
      list:[]
    },
    add (newValue) {
      if (this.debug) console.log('add ', newValue)
      this.state.list.push(newValue)
    },
    remove (index) {
      if (this.debug) console.log('clear')
      return this.state.list.slice(index, index + 1)
    },
    get(index) {
        if(this.debug) console.log("get " + index)
        return this.state.list[index]
    }
  }

  export default store