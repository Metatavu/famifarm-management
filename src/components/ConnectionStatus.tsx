import * as React from "react";
import * as Noty from "noty";

import "../../node_modules/noty/lib/noty.css";
import "../../node_modules/noty/lib/themes/mint.css";
import strings from "src/localization/strings";

const CONNECTION_CHECK_RATE = 10000;
const API_URL = process.env.REACT_APP_FAMIFARM_API_BASE_PATH || "http://localhost"

interface State {
  failureDetected: boolean
}

/**
 * Component for checking connection status
 */
class ConnectionStatus extends React.Component<any, State> {

  private connectionTimer: any;
  
  constructor(props: any) {
    super(props);
    this.state = {
      failureDetected: false
    }
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = () => {
    this.connectionTimer = setInterval(async () => {
      await this.checkConnection();
    }, CONNECTION_CHECK_RATE);
  }

  /**
   * Component will unmount life cycle method
   */
  public componentWillUnmount = () => {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer);
    }
  }

  /**
   * Render nothing
   */
  public render() {
    return null;
  }

  /**
   * Handle connection failure
   */
  private onConnectionFailure = () => {
    if (this.state.failureDetected) {
      return;
    }

    new Noty({
      type: "error",
      text: strings.connectionErrorText,
      timeout: false,
      killer: true
    }).show();

    this.setState({
      failureDetected: true
    });
  }

  /**
   * Handle connection success
   */
  private onConnectionSuccess = () => {
    if (!this.state.failureDetected) {
      return;
    }

    new Noty({
      type: "success",
      text: strings.connectionSuccessText,
      timeout: 3000,
      killer: true
    }).show();

    this.setState({
      failureDetected: false
    });
  }

  /**
   * Performs connection check
   */
  private checkConnection = async () => {
    const pingUrl = `${API_URL}/v1/system/ping`;
    try {
      const response = await fetch(pingUrl);
      if (!response.ok) {
        this.onConnectionFailure();
        return;
      }

      this.onConnectionSuccess();
    } catch(e) {
      this.onConnectionFailure();
    }
  }
}

export default ConnectionStatus;