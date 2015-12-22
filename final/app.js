/*
- UI components (class)
	  - home (subclass)
	  - floor plan view (subclass)
	    - draw mode (element)
	    - erase (element)
	    - save (element)
	    - close (element)
	- canvas (subclass)
	- bottom (subclass)
	  - users (subclass)
	  - VR view (element)
	  - 3D view (element)
<App>
	<HomeNav />

	<DrawNav>
	  <DrawNavControls>
	  	  <Draw />
		  <Erase />
		  <Save />
		  <Close />
	  </DrawNavControls>
	</DrawNav>

	<Canvas />

	<Footer>
	  <Users />
	  <ViewVR />
	  <View3D />
	</Footer>
</App>

*/

// var Users = React.createClass({
// 	render: function() {
// 		return (
// 			<div className="users left">
// 				<button>user1</button>
// 				<button>user2</button>
// 			</div>
// 		)
// 	}
// });
var Loader = React.createClass({
	render: function() {
		return (
			<div className="loader">
				<span className="star"><img src="../assets/load-star-black.svg" width="18" height="18"/></span>
				<span className="star"><img src="../assets/load-star-black.svg" width="15" height="15"/></span>
				<span className="star"><img src="../assets/load-star-black.svg" width="12" height="12"/></span>
			</div>
		)
	}
});

var Footer = React.createClass({
	render: function() {
		return (
			<footer className="footer ui-elements">
				<div className="right"><img src="../assets/VRicon.svg" height="18"/></div>
			</footer>
		)
	}
});

var Canvas = React.createClass({
	contextTypes : {
		setVrMode : React.PropTypes.func
	},
	componentDidMount: function() {
		if (this.props.drawMode) {
			this.draw2D();
		} else {
			this.draw3D();
		}
	},
	componentDidUpdate: function(p,s,c) {
		if (p.drawMode != this.props.drawMode) {
			if (this.props.drawMode) {
				this.draw2D();
			} else {
				this.draw3D();
			}
		}
	},
	draw3D: function() {
		// draw();
		this.context.setVrMode(true);
	},
	clear3D: function() {
		this.context.setVrMode(false);
	},
	draw2D: function() {
		this.clear3D();
		console.log('floorplan')
		setupDrawingCanvas(); // setup drawingPad
	},
	render: function() {
		return (
			this.props.drawMode ? (
				<canvas key="drawCanvas" id="drawCanvas">
					Please use a browser that supports "canvas"
				</canvas>
			):(
				<div key="canvas2" id="canvas2">
				</div>
			)
		)
	}
});

var DrawNavControls = React.createClass({
	contextTypes: {
		drawMode : React.PropTypes.bool,
		setDrawMode : React.PropTypes.func
	},
	drawOnModel: function() {
		this.context.setDrawMode(false);
			// makeWebVr().addDrawing();
	},
	render: function() {
		return (
			<div className="draw-nav-controls">
				<button onClick={this.drawOnModel}>Draw</button> 
				<button>Erase</button>
				<button>Save</button>
				<button>Close</button>
			</div>
		)
	}
});

// var DrawNav = React.createClass({
// 	getInitialState: function() {
// 		return {
// 			drawMode : false
// 		}
// 	},
// 	enableDrawMode: function() {
// 		this.setState({drawMode: true});
// 	},
// 	render: function() {
// 		return (
// 			<div className="draw-nav right">
// 				<button onClick={this.enableDrawMode}>Floor Plan</button>
// 				{
// 					this.state.drawMode ?
// 					(<DrawNavControls />):
// 					("")
// 				}
// 			</div>
// 		)
// 	}
// });

// var HomeNav = React.createClass({
// 	render: function() {
// 		return (
// 			<div className="home-nav left">
// 				<button>Home</button>
// 			</div>
// 		)
// 	}
// });

var Header = React.createClass({
	// getInitialState: function() {
	// 	return {
	// 		drawMode : false
	// 	}
	// },
	// enableDrawMode: function() {
	// 	this.setState({drawMode: true});
	// },
	render: function() {
		return (
			<header className="header ui-elements">
				<a href="/">
					<div className="home-nav left">
						<img src="../assets/logo.svg" height="18"/>					
					</div>
				</a>
				
				<div className="draw-nav right">
				<div onClick={this.props.onClick} id="draw-nav"><img src="../assets/floorplanIcon.svg" height="45"/></div>
					{
						this.props.drawMode ?
						(<DrawNavControls />):
						("")
					}
				</div>
			</header>
		)
	}
});

var App = React.createClass({
	childContextTypes: {
		drawMode : React.PropTypes.bool,
		setDrawMode : React.PropTypes.func,
		setVrMode : React.PropTypes.func
	},
	getChildContext: function() {
		return {
			drawMode : this.state.drawMode,
			setDrawMode : this.setDrawMode,
			setVrMode : this.setVrMode
		};
	},
	getInitialState: function() {
		return {
			loaded : false,
			drawMode: false,
			vrMode : null
		}
	},
	handleChildClick: function() {
		this.setState({
			drawMode: !this.state.drawMode
		}, function() {
			console.log('changed state')
		});
	},
	componentDidMount: function() {
		setTimeout(function() {
			this.setState({ loaded: true });
		}.bind(this), 2000);
	},
	render: function() {
		return this.state.loaded ? (
			<div className="app">
				<Header onClick={this.handleChildClick} drawMode={this.state.drawMode}/> 
				<Canvas drawMode={this.state.drawMode}/>

			</div>
		) :
		( 
			<Loader />
		)
	},
	setVrMode: function(val) {
		if (val != this.state.vrMode) {
			console.log('clearVRMode', val)
			this.setState({ vrMode: (val ? (new makeWebVr()) : null)})
		}
	},
	setDrawMode: function(val) {
		this.setState({drawMode: val});
	}
});

ReactDOM.render(
 	<App />,
 	document.getElementById('content')
);




