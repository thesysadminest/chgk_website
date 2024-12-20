// Filename - src/App.js

import React from 'react';
import axios from 'axios';

class App extends React.Component {

    state = {
        details : [],
    }

    componentDidMount() {

        let data ;

        axios.get('http://localhost:8000/api/question/1')
        .then((response) => {
            data = response.data;
            this.setState({
                details : data    
            });
            console.log(data);
        })
        .catch(err => {})
    }

  render() {
    return(
      <div>
            {this.state.details.map((detail) =>  (
            <div >
                  <div >
                        <h1> "IT WORKS!"" </h1>
                        <h1>{detail.question_text} </h1>
                        <footer >
                        <cite title="Source Title">
                        {detail.answer_text}</cite>
                        </footer>
                  </div>
            </div>
            )
        )}
      </div>
      );
  }
}

export default App;