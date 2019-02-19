import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import WelcomePage from "../containers/WelcomePage";

class App extends React.Component {

  /**
   * Render App component
   */
  public render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Route path="/" component={WelcomePage} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;



