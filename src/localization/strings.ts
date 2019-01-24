import LocalizedStrings, { 
  LocalizedStringsMethods
} from 'localized-strings';

export interface IStrings extends LocalizedStringsMethods {
  menuBarUserItemText: string
  menuBarManageAccountText: string
  menuBarLogoutText: string
  welcomeLoginButtonText: string
  deleteButtonText: string
  deleteBeerHeader: string
  deletebeerText: string
  deleteBeerYesText: string
  deleteBeerNoText: string
  addBeerText: string
  addBeerInstructions: string
  addBeerCancelText: string
  addBeerOkText: string
  addBeerPlaceholderText: string
  editFormName: string
  editFormDescription: string
  editFormAbv: string
  editFormIbu: string
  editFormStyle: string
  editFormBrewery: string
  editFormFlavors: string
  editFormEditButton: string
  editFormExternalServiceHeader: string
  editFormExternalServiceOkButton: string
  editFormSubmitButton: string,
  quessFlavorsCheckboxLabel: string
}

const strings: IStrings = new LocalizedStrings({
  en: require("./en.json")
});

export default strings;