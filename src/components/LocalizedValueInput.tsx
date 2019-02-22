import * as React from "react";

import {
  Form,
  Input,
  InputOnChangeData
} from "semantic-ui-react";
import { LocalizedEntry } from "famifarm-typescript-models";

export interface Props {
  value?: LocalizedEntry
  languages: string[]
  onValueChange: (value: LocalizedEntry) => void
}

export interface State {}

class LocalizedValueInput extends React.Component<Props, State> {

    /**
   * Handle detail data change
   * 
   * @param e Event
   * @param {name, value} Input name and value
   */
  private handleValueChange = (e: any, { name, value }: InputOnChangeData) => {
    const currentValue = this.props.value || [];

    let updated = false;
    currentValue.forEach((localizedValue) => {
      if (localizedValue.language === name) {
        localizedValue.value = value;
        updated = true;
      }
    })

    if (!updated) {
      currentValue.push({
        language: name,
        value: value
      });
    }
    this.props.onValueChange(currentValue);
  } 

  private getValueByLanguage = (language: string): string => {
    if (!this.props.value) {
      return "";
    }

    const localizedValue = this.props.value.find(value => value.language === language);
    if (!localizedValue) {
      return "";
    }

    return localizedValue.value;
  }

  /**
   * Render edit view for package size
   */
  public render() {

    const items = this.props.languages.map((language: string) => {
      return (
        <Form.Field key={language}>
          <Input
            label={language}
            value={this.getValueByLanguage(language)}
            name={language}
            placeholder={language} 
            onChange={this.handleValueChange}
          />
        </Form.Field>
      )
    });

    return (
      <div>
        {items}
      </div>
    );
  }
}

export default LocalizedValueInput;