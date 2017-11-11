import Box2D from 'box2d-es6';

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

	const bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	//SetAsBox units are half-width half-height, the pivot point is in the middle
	fixDef.shape.SetAsBox(300 / SCALE, 5 / SCALE);
	bodyDef.position.Set(300 / SCALE, 395 / SCALE); //BOTTOM
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	bodyDef.position.Set(300 / SCALE , 5 / SCALE); //TOP
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	fixDef.shape.SetAsBox(5 / SCALE, 200 / SCALE);
	bodyDef.position.Set(5 / SCALE, 200 / SCALE); //LEFT
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	bodyDef.position.Set(595 / SCALE, 200 / SCALE);
	world.CreateBody(bodyDef).CreateFixture(fixDef); //RIGHT

	//create some objects
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(40 / SCALE, 20 / SCALE); //For 80x40 box
	bodyDef.position.x = 90 / SCALE;
	bodyDef.position.y = 30 / SCALE;
	let body = world.CreateBody(bodyDef);
	body.CreateFixture(fixDef);
	body.SetUserData(document.querySelector('#box'));

	bodyDef.type = b2Body.b2_staticBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(20 / SCALE, 20 / SCALE); //for 40x40 box
	bodyDef.position.x = 130 / SCALE;
	bodyDef.position.y = 100 / SCALE;
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixDef);

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
	debugDraw.SetDrawScale(SCALE);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);

	window.setInterval(update, 1000 / 60);

	function update() {
		world.Step(1 / 60, 10, 10);
		world.DrawDebugData();
		world.ClearForces();

		let it = world.GetBodyList();

		while (it) {
			const el = it.GetUserData();
			if (el) {
				/**
				 * Need to adjust the pivot points, since the box2d body pivot point is the middle
				 * and the DOM el is the top/left, need to subtract half the element width & height
				 */
				el.style.left = `${(it.GetPosition().x * SCALE) - 40}px`;
				el.style.top = `${(it.GetPosition().y * SCALE) - 20}px`;
				el.style.transform = `rotateZ(${it.GetAngle() * 180 / Math.PI}deg)`;
			}

			it = it.GetNext();
		}
	}
}

init();
