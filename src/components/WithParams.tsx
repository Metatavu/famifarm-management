import Keycloak from "keycloak-js"
import { useParams } from "react-router-dom"

interface Props {
  Component: React.ComponentType<any>
  keycloak: Keycloak,
  routeParamNames: string[]
}

export const WithParams: React.FC<Props> = ({
  Component,
  keycloak,
  routeParamNames
}) => {
  const params = useParams();
  let paramMap: any = {}
  routeParamNames.forEach(name => {
    paramMap[name] = params[name];
  });
  return <Component keycloak={keycloak} {...paramMap} />
}