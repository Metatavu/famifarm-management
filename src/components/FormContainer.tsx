import * as React from "react";
import { Form, FormProps, Message, Transition } from "semantic-ui-react";
import strings from "../localization/strings";


/**
 * Component props
 */
interface Props extends FormProps {
  
}

/**
 * Component state
 */
interface State {
  pristine: boolean
  shake: boolean
  error: boolean
}

export class FormContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      pristine: true,
      shake: true,
      error: false
    };
  }

  /**
   * Component did update lifecycle method
   */
  public componentWillMount = () => {
    const { error } = this.state;
    const newError = this.validateForm(this.props.children);
    if (error !== newError) {
      this.setState({
        error: newError
      });
    }
  }

  /**
   * Component did update lifecycle method
   */
  public componentDidUpdate = () => {
    const { error } = this.state;
    const newError = this.validateForm(this.props.children);
    if (error !== newError) {
      this.setState({
        error: newError
      });
    }
  }

  /**
   * Render edit view for package size
   */
  public render() {

    const childComponents = this.attachSubmitHandlers(this.props.children);
    return (
      <Transition animation="shake" duration={500} visible={this.state.shake}>
        <Form
          error={!this.state.pristine && this.state.error}
          {...this.props}
        >
          {childComponents}
          <Message 
            error
            content={strings.missingRequiredFieldError}
          />
        </Form>
      </Transition>
    );
  }

  /**
   * Validates form and its child components
   */
  private validateForm = (children?: any): boolean => {
    let error = false;
    React.Children.forEach(children, (childComponent: any, i: number) => {
      let child = childComponent;
      if (child && child.type === React.Fragment) {
        error = this.validateForm(child.props.children);
      }

      if (child && child.props && child.props.required) {
        if ('value' in child.props) {
          if (!child.props.value) {
            error = true;
          }
        } else {
          React.Children.forEach(child.props.children, (subChild: any, i: number) => {
            if (subChild && subChild.props) {
              if ('value' in subChild.props) {
                if (!subChild.props.value) {
                  error = true;
                }
              }
            }
          })
        }
      }
    });

    return error;
  }

  /**
   * Attaches submit handlers to form
   */
  private attachSubmitHandlers = (children?: any): any[] => {
    if (!children) {
      return [];
    }

    return React.Children.map(this.props.children as any, (childComponent: any, i: number) => {
      let child = childComponent;

      if (child && child.props && child.props.type && child.props.type == "submit" && child.props.onClick) {
        const clickHandler = child.props.onClick;
        return React.cloneElement(child, {
          onClick: (() => {
            if (!this.state.error) {
              clickHandler();
            } else {
              this.setState({pristine: false, shake: !this.state.shake});
            }
          })
        })
      }

      return child;
    });
  }
}