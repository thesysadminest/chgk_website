export default class User {
  username = null;
} 

const tryUser = localStorage.getItem("user");
if (tryUser == null) {
    localStorage.setItem("user", JSON.stringify(new User()));
    alert("user null"); 
}
