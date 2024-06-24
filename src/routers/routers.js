import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {Pagina2} from './login_registro/pagina2';

export const Routes = () => {
    return(
        <Router>
            <Switch>
                <Router path="/">
                    <Paginaprincipal/>
                </Router>
                <Router path="/2">
                    <Pagina2/>
                </Router>
            </Switch>
        </Router>
    )
}//<RegistrationForm onSuccess={handleRegistrationSuccess} />