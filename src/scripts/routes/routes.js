import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import DetailPage from '../pages/detail/detail-page';
import AddStoryPage from '../pages/add/add-story-page';
import MapPage from '../pages/map/map-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/detail/:id': new DetailPage(),
  '/add': new AddStoryPage(),
  '/map': new MapPage(),
};

export default routes;