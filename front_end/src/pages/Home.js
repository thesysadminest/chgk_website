
import "../styles/Home.css"

var home_template = require('.templates/base_generic.html')

function Home() {
    return (<iframe title="Home" src={home_template}> </iframe>);
}

export default Home