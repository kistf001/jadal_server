const mdbConn = require('../db/mariaDBRefrash.js');

let modified_cheack_data, new_cheack_data;
let _cheack = () => {
    mdbConn.refrash_modified().then((data)=>{
        modified_cheack_data = data.map((v,i)=>{ return {key:v.key,title:v.title_t,date:v.date,} });
        //console.log(modified_cheack_data)
    })
    mdbConn.refrash_new().then((data)=>{
        new_cheack_data = data.map((v,i)=>{ return {key:v.key,title:v.title} });
        //console.log(new_cheack_data)
    })
}
setInterval(()=>{ _cheack() },1000); _cheack()

function modified_cheack_data_(){
    return  modified_cheack_data
}
function new_cheack_data_(){
    return  new_cheack_data
}


module.exports = { 
    modified_cheack_data:modified_cheack_data_,
    new_cheack_data:new_cheack_data_,
}