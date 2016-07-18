import React from 'react';

class Header extends React.Component {
	render() {
		return <header id="nav">
			<a href="#" className="nav-icon">
				<img src={this.props.icon} alt="icon" />
				<span>Diary</span>
			</a>
			<span className="nav-opt">
				<a href="#">工作</a>
				<a href="#">学习</a>
				<a href="#">生活</a>
				<a href="#">我的</a>
			</span>
		</header>
	}
}

export default Header;