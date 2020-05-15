import { TASK_ID, TASK_STATUS } from "../constants"

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
    },
    getByID(id) {
      if(this.debug) console.log("get by id " + id)
      return this.state.list.find(item => {return item[TASK_ID] == id})
    },
    setStatusByIndex(index, status){
      if(this.debug) console.log("set status by index" + index + " " + status)
      this.state.list[index][TASK_STATUS] = status
    }
  }

  export default store