import Box2D from 'box2d-es6';
import _ from 'lodash';

function init() {
	const SCALE = 30.0;
	const b2Vec2 = Box2D.Common.Math.b2Vec2;
	const b2BodyDef = Box2D.Dynamics.b2BodyDef;
	const b2Body = Box2D.Dynamics.b2Body;
	const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	const b2World = Box2D.Dynamics.b2World;
	const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	const world = new b2World(
		new b2Vec2(0, 10), //gravity
		true               //allow sleep
	);

	const fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	function buildBoundingBox(width, height) {
		const borderWidth = 10;
		//create ground
		const bodyDef = new b2BodyDef;

		bodyDef.type = b2Body.b2_staticBody;
		fixDef.shape = new b2PolygonShape;
		//SetAsBox units are half-width half-height, the pivot point is in the middle
		fixDef.shape.SetAsBox((width / 2) / SCALE, (borderWidth / 2) / SCALE);
		bodyDef.position.Set((width / 2) / SCALE, (height - borderWidth / 2) / SCALE); //BOTTOM
		world.CreateBody(bodyDef).CreateFixture(fixDef);

		bodyDef.position.Set((width / 2) / SCALE ,(borderWidth / 2) / SCALE); //TOP
		world.CreateBody(bodyDef).CreateFixture(fixDef);

		fixDef.shape.SetAsBox((borderWidth / 2) / SCALE, (height / 2) / SCALE);
		bodyDef.position.Set((borderWidth / 2) / SCALE, (height / 2) / SCALE); //LEFT
		world.CreateBody(bodyDef).CreateFixture(fixDef);

		bodyDef.position.Set((width - borderWidth / 2) / SCALE, (height / 2) / SCALE);
		world.CreateBody(bodyDef).CreateFixture(fixDef); //RIGHT
	}

	buildBoundingBox(800, 600);

	function scanAndCreateObjects() {
		const elements = document.querySelectorAll('#container>*');

		Array.from(elements).forEach(el => {
			const {width, height} = el.getBoundingClientRect();
			const computedStyle = getComputedStyle(el);
			const left = parseInt(computedStyle.left);
			const top = parseInt(computedStyle.top);

			const bodyDef = new b2BodyDef;

			bodyDef.type = el.id === 'static' ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((width / 2) / SCALE, (height / 2) / SCALE);
			bodyDef.position.x = (left + width / 2) / SCALE;
			bodyDef.position.y = (top + height / 2) / SCALE;
			let body = world.CreateBody(bodyDef);
			body.CreateFixture(fixDef);
			body.SetUserData({
				el,
				width,
				height,
				widthd2: width / 2,
				heightd2: height / 2
			});
		});
	}

	scanAndCreateObjects();

	//setup debug draw
	const debugDraw = new b2DebugDraw();

	//Monkey patch debugDraw bug
	debugDraw.m_sprite = {
		graphics: {
			clear: function () {
				debugDraw.m_ctx.clearRect(0, 0, debugDraw.m_ctx.canvas.width, debugDraw.m_ctx.canvas.height);
			}
		}
	};

	debugDraw.SetSprite(document.getElementById('canvas').getContext('2d'));
	debugDraw.SetDrawScale(SCALE / 4);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);

	requestAnimationFrame(update);
	world.DrawDebugData();
	const timeLine = [];
	const rewinded = [];
	let paused = false;

	function update() {
		world.Step(1 / 60, 10, 10);
		world.DrawDebugData();
		world.ClearForces();

		let it = world.GetBodyList();
		timeLine.push(_.cloneDeep(it));

		updateElements(it);

		if (!paused) {
			requestAnimationFrame(update);
		}
	}

	function updateElements(body) {
		while (body) {
			const {el, widthd2, heightd2} = body.GetUserData() || {};
			if (el) {
				/**
				 * Need to adjust the pivot points, since the box2d body pivot point is the middle
				 * and the DOM el is the top/left, need to subtract half the element width & height
				 */
				el.style.left = `${(body.GetPosition().x * SCALE) - widthd2}px`;
				el.style.top = `${(body.GetPosition().y * SCALE) - heightd2}px`;
				el.style.transform = `rotateZ(${body.GetAngle() * 180 / Math.PI}deg)`;
			}

			body = body.GetNext();
		}
	}

	function stepForward() {
		if  (rewinded.length === 0) {
			update();
		} else {
			const nextStep = rewinded.pop();
			updateElements(nextStep);
			timeLine.push(nextStep);
			requestAnimationFrame(stepForward);
		}
	}

	function stepBackward() {
		const prevStep = timeLine.pop();
		if (!prevStep) {
			return;
		}

		updateElements(prevStep);
		rewinded.push(prevStep);
		requestAnimationFrame(stepBackward);
	}

	window.onkeydown = ev => {
		if (ev.key === 'ArrowRight') {
			paused = true;

			stepForward();
			ev.preventDefault();
		} else if (ev.key === 'ArrowLeft') {
			paused = true;

			stepBackward();

			ev.preventDefault();
		} else if (ev.key === 'p') {
			paused = !paused;

			if (!paused) {
				requestAnimationFrame(update);
			}
		}
	};
}

init();
