import HomePage from '../pages/home/home-page';
import DetailPage from '../pages/detail/detail-page';
import AddStoryPage from '../pages/add/add-story-page';
import MapPage from '../pages/map/map-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';

const routes = {
  '/': new HomePage(),
  '/detail/:id': new DetailPage(),
  '/add': new AddStoryPage(),
  '/map': new MapPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;