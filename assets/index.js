import React from 'react';
import ReactDOM from "react-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Router>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Router>
);