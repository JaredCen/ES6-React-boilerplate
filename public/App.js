import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header.js';
import Main from './components/Main.js';
import Footer from './components/Footer.js';

class Root extends React.Component {
	render() {
		return <section id="root">
			<Header icon="../public/image/logo.png" />
			 <Main />
			<Footer />
		</section>
	}
}

ReactDOM.render(<Root />, document.getElementById('react-root'));