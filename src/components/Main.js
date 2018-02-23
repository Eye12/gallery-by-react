require('normalize.css/normalize.css');
require('styles/css/app.css');

import React from 'react';
import ReactDOM from 'react-dom';

// 构建随机取值函数
function random(low, high) {
	return Math.ceil(Math.random() * (high - low) + low);
}


// 构建随机取角度函数，范围0-30之间的正负值
function get30DegRandom() {
	return ((Math.random() > .5 ? '' : '-') + Math.ceil((Math.random() + 0.1) * 30));
}

// 获取所有图片数据并为其一一添加对应的URL
var imgDatas = require('../data/imgDatas.json');
imgDatas = (function(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i].url = require('../image/' + arr[i].fileName);
	}
	return arr;
})(imgDatas);


// 单个图片组件
class ImgFigure extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		e.stopPropagation();
		e.preventDefault();

		if (this.props.data_state.isCenter) {
			this.props.inverse();
		} else {
			this.props.center();
		}
	}


	render() {
		var styleObj = this.props.data_state.pos;
		var imgFigClassName = 'imgFig';

		// 如果是中心图片设置z-index的值为11
		if (this.props.data_state.isCenter) {
			styleObj.zIndex = 11;
			imgFigClassName += ' is-center';
			imgFigClassName += this.props.data_state.isInverse ? ' is-inverse' : '';
		}

		// 如果旋转角度不为0, 添加旋转角度
		if (this.props.data_state.rotate) {
			var prefix = ['transform', 'MozTransform', 'msTransform', 'WebkitTransform'];
			prefix.forEach(function(e) {
				styleObj[e] = 'rotate(' + this.props.data_state.rotate + 'deg)';
			}.bind(this));
		}



		return (
			<figure className={ imgFigClassName } style = { styleObj } onClick = { this.handleClick } >
				<img src = { this.props.data_img.url } alt = { this.props.data_img.title } />
				<figcaption className='title'>
					<h2>{ this.props.data_img.title }</h2>
				</figcaption>
				<div className='img-back'  onClick = { this.handleClick } >
					<h2> { this.props.data_img.desc } </h2>
				</div>
			</figure>

		)
	}
}

// 构建翻转按钮组件
class ControllerSpan extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		e.stopPropagation();
		e.preventDefault();

		if (this.props.data_state.isCenter) {
			this.props.inverse();
		} else {
			this.props.center();
		}
	}

	render() {
		var controllerSpanClassName = 'controller-span';
		if (this.props.data_state.isCenter) {
			controllerSpanClassName += ' is-center';
			if (this.props.data_state.isInverse) {
				controllerSpanClassName += ' is-inverse';
			}
		}


		return (
			<span className = { controllerSpanClassName } onClick = { this.handleClick } ></span>
		)
	}
}

// 主控件
class AppComponent extends React.Component {
	// 构建状态数据
	constructor(props) {
		super(props);
		this.state = {
			stateArr: [
				// {
				// 	pos: {
				// 		left: 0,
				// 		top: 0
				// 	},
				// 	isCenter: false,
				// 	isInverse: false,
				// 	rotate: 0
				// }
			]
		};
		this.coordRange = {
			centerCoord: {
				left: 0,
				top: 0
			},
			l_r_coordRange: {
				leftX: [0, 0],
				rightX: [0, 0],
				l_r_y: [0, 0]
			},
			topCenterRange: {
				topCenterX: [0, 0],
				topCenterY: [0, 0]
			}
		}
	}

	// 构建重新排布函数
	rearrange(centerIndex) {
		// 获取相关数据计算备用
		var stateArr = this.state.stateArr,
			coordRange = this.coordRange,
			centerCoord = coordRange.centerCoord,
			l_r_coordRange = coordRange.l_r_coordRange,
			leftX = l_r_coordRange.leftX,
			rightX = l_r_coordRange.rightX,
			l_r_y = l_r_coordRange.l_r_y,
			topCenterRange = coordRange.topCenterRange,
			topCenterX = topCenterRange.topCenterX,
			topCenterY = topCenterRange.topCenterY;

		// 取出指定索引状态数据作为中心图片计算赋值
		var centerImg = stateArr.splice(centerIndex, 1);
		centerImg[0] = {
			pos: centerCoord,
			isCenter: true,
			isInverse: false,
			rotate: 0
		}


		// 随机取值0-1个状态数据排布于上中区范围内计算赋值
		var imgNum = Math.floor(Math.random() * 2),
			imgIndex = Math.round(Math.random() * (stateArr.length - imgNum)),
			imgArr = stateArr.splice(imgIndex, imgNum);
		for (var i = 0; i < imgArr.length; i++) {
			imgArr[i] = {
				pos: {
					left: random(topCenterX[0], topCenterX[1]),
					top: random(topCenterY[0], topCenterY[1])
				},
				isCenter: false,
				isInverse: false,
				rotate: get30DegRandom()
			}
		}

		// 按照一定方式将剩下的数据随机排布于左右分区计算赋值
		for (var i = 0; i < stateArr.length; i++) {
			var l_r_x = null;
			if (i < Math.ceil(stateArr.length / 2)) {
				l_r_x = leftX;
			} else {
				l_r_x = rightX;
			}
			stateArr[i] = {
				pos: {
					left: random(l_r_x[0], l_r_x[1]),
					top: random(l_r_y[0], l_r_y[1])
				},
				isCenter: false,
				isInverse: false,
				rotate: get30DegRandom()
			}
		}


		// 将取出来的状态数据重新放回状态数据组
		if (imgArr && imgArr[0]) {
			stateArr.splice(imgIndex, 0, imgArr[0]);
		}
		stateArr.splice(centerIndex, 0, centerImg[0]);

		// 重新设置状态数据
		this.setState({
			stateArr: stateArr
		})
	}

	// 所有组件第一次渲染完成后获取并计算相关数据
	componentDidMount() {
		// 获取舞台DOM并计算赋值相关数据
		var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
			stageW = stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.ceil(stageW / 2),
			halfStageH = Math.ceil(stageH / 2);

		// 获取单个图片组件DOM并计算赋值相关数据
		var imgFigDOM = ReactDOM.findDOMNode(this.refs.imgFig0),
			imgW = imgFigDOM.scrollWidth,
			imgH = imgFigDOM.scrollHeight,
			halfImgW = Math.ceil(imgW / 2),
			halfImgH = Math.ceil(imgH / 2);

		// 中心坐标计算赋值
		this.coordRange.centerCoord = {
			left: halfStageW - halfImgW,
			top: halfStageH - halfImgH * 2
		}

		// 左右分区取值范围计算赋值
		this.coordRange.l_r_coordRange.leftX[0] = -halfImgW;
		this.coordRange.l_r_coordRange.leftX[1] = halfStageW - imgW * 2;
		this.coordRange.l_r_coordRange.rightX[0] = halfStageW + imgW;
		this.coordRange.l_r_coordRange.rightX[1] = stageW - halfImgW;
		this.coordRange.l_r_coordRange.l_r_y[0] = -halfImgH;
		this.coordRange.l_r_coordRange.l_r_y[1] = stageH - halfImgH;

		// 上中分区取值范围计算
		this.coordRange.topCenterRange.topCenterX[0] = halfStageW - imgW;
		this.coordRange.topCenterRange.topCenterX[1] = halfStageW + imgW;
		this.coordRange.topCenterRange.topCenterY[0] = -halfImgH;
		this.coordRange.topCenterRange.topCenterY[1] = halfStageH - imgH * 3;

		// 调用重新排布函数
		this.rearrange(0);

	}

	// 构建图片居中函数
	center(i) {
		return function() {
			this.rearrange(i);
		}.bind(this);
	}

	// 构建翻转函数
	inverse(i) {
		return function() {
			var stateArr = this.state.stateArr;
			stateArr[i].isInverse = !stateArr[i].isInverse;

			this.setState({
				stateArr: stateArr
			})
		}.bind(this);
	}

	render() {
		var imgFigArr = [],
			controllerArr = [];
		imgDatas.forEach(function(e, i) {
			// 初始化所有状态数据
			if (!this.state.stateArr[i]) {
				this.state.stateArr[i] = {
					pos: {
						left: 0,
						top: 0
					},
					isCenter: false,
					isInverses: false,
					rotate: 0
				}
			}


			imgFigArr.push(<ImgFigure key = { i } data_img = { e } data_state = { this.state.stateArr[i]}
      ref = {'imgFig' + i}  center = { this.center(i) } inverse = { this.inverse(i) } />)

			controllerArr.push(<ControllerSpan key = { i } data_state = { this.state.stateArr[i]} center = { this.center(i) } inverse = { this.inverse(i) } />)
		}.bind(this));


		return (
			<section className="stage" ref='stage'>
				<section className="img-sec">
					{ imgFigArr }
				</section>
				<section className="controller-nav">
					{ controllerArr }
				</section>
			</section>
		);
	}
}

AppComponent.defaultProps = {};

export default AppComponent;