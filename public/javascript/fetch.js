// test.js
//
// Author: Richard M. Sullivan
//
// Description:
// This is a test to learn about the canvas element. This is for the purpose of
// creating interactive demonstrations for my website.
//

class Game {
  constructor(width, height, fps, ctx) {
    this.name = "Game";
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.ctx = ctx;
    this.time = performance.now();
    this.components = [];
    this.quit_game = false;
  }

  update() {
    this.time = performance.now();

    for (let i = 0; i < this.components.length; i++) {
      this.components[i].update();
    }
  }

  draw() {

    // clear the screen
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.components.length; i++) {
      this.components[i].draw();
    }
  }

  deltaTime() {
    let now = performance.now();
    let delta = now - this.time;

    return delta;
  }

  waitTime() {
    let now = performance.now();
    let delta = now - this.time;

    let wait = 1000 / this.fps - delta;
    if (wait < 0) {
      wait = 0;
    }

    return wait;
  }

  gameLoop() {
    this.time = performance.now();

    if (this.quit_game === true) { return; }

    this.update();
    this.draw();

    setTimeout(() => { this.gameLoop(); }, this.waitTime());
  }

  addComponent(component) {
    this.components.push(component);
  }

  getComponent(name) {
    let components = [];

    for (let i = 0; i < this.components.length; i++) {
      if (this.components[i].name == name) {
        components.push(this.components[i]);
      }
    }

    return components;
  }

  removeComponent(component) {
    for (let i = 0; i < this.components.length; i++) {
      if (this.components[i].name == "Ball") {
        this.components.splice(i, 1);
        return;
      }
    }
  }

  quit() {
    this.quit_game = true;
  }
}

class Ball {
  constructor(color, size, x, y, game) {
    this.name = "Ball";
    this.game = game;
    this.ctx = this.game.ctx;
    this.color = color;
    this.size = size;
    this.x = x;
    this.y = y;
    this.x_velocity = 0;
    this.y_velocity = 0;
    this.resetBallVelocity();
  }

  update() {

    if (Math.abs(this.x_velocity) < 0.1) {
      this.x_velocity = 0;
    }

    if (Math.abs(this.y_velocity) < 0.1) {
      this.y_velocity = 0;
    }

    this.y_velocity += 0.3;

    this.x = this.x + this.x_velocity;
    this.y = this.y + this.y_velocity;

    // if there is a collision with a wall on the x axis
    if (this.x < 0 || this.x > this.game.width - this.size) {

      this.x_velocity /= 3;
      this.y_velocity /= 1.5;

      //reflect across y axis
      this.x_velocity *= -1;

      // if ball on left side
      if (this.x < 0) {
        this.x = 0;
      }

      // if ball on right side
      else if (this.x > this.game.width - this.size) {
        this.x = this.game.width - this.size;
      }
    }

    // if there is a collision with a wall on the y axis
    if (this.y < 0 || this.y > this.game.height - this.size) {
      this.x_velocity /= 1.5;
      this.y_velocity /= 3;

      //reflect across x axis
      this.y_velocity *= -1;

      // if ball on top
      if (this.y < 0) {
        this.y = 0;
      }

      // if ball on bottom
      else if (this.y > this.game.height - this.size) {
        this.y = this.game.height - this.size;
      }
    }
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  resetBallVelocity() {
    let velocity = Math.random() * 10 + 5;
    let direction = Math.random() * 2 * 3.14;
    this.x_velocity = Math.cos(direction) * velocity;
    this.y_velocity = Math.sin(direction) * velocity;
  }
}

class Person {
  constructor(x, y, game) {
    this.name = "Person";
    this.position = new Tuple(x, y);
    this.intermediate_position = new Tuple(null, null);
    this.waited = false;
    this.wanted_position = new Tuple(x, y);

    this.step_size = 20;

    this.vel = new Tuple(0, 0);

    this.pelvis = new Tuple(this.position.x, this.position.y - 30);
    this.neck = new Tuple(this.pelvis.x, this.pelvis.y - 20);

    this.left_foot = new Tuple(this.pelvis.x - 10, this.pelvis.y + 30);
    this.right_foot = new Tuple(this.pelvis.x + 10, this.pelvis.y + 30);

    this.left_hand = new Tuple(this.pelvis.x - 10, this.pelvis.y);
    this.right_hand = new Tuple(this.pelvis.x + 10, this.pelvis.y);

    this.nudge = 0;
    this.nudge_direction = 1;

    this.game = game;
    this.ctx = this.game.ctx;
    this.state = { state: "spawned", substate: "" };
    this.frame = 0;

    this.states = ["spawned", "has ball", "throwing", "waiting", "fetching", "grabbing ball"];

    this.ball = new Ball("red", 6, this.left_hand.x, this.left_hand.y, this.game);

    this.has_ball = true;
    this.dog_gave_me_ball = false;

    this.cocked = false;
    this.cocked_hand_pos = new Tuple(0, 0);

  }

  update() {
    // apply gravity
    this.vel.y += 0.5;
    this.position.y += this.vel.y;

    // collision detection with ground
    if (this.position.y > this.game.height) {
      this.position.y = this.game.height;
      this.vel.y = 0;
    }

    // spawned state
    // transitions to waiting state
    if (this.state["state"] === "spawned") {

      this.position_body();

      if (this.position.y === this.game.height) {
        this.state["state"] = "waiting";
        this.state["substate"] = "";
      }

      return;
    }

    // grabbing ball state
    // transitions to waiting state
    if (this.state["state"] === "grabbing ball") {
      this.has_ball = true;
      this.dog_gave_me_ball = false;

      this.state["state"] = "waiting";
    }

    // waiting state
    // transitions to:
    //    throwing state - if you have the ball
    //    fetching state - if you don't have the ball
    if (this.state["state"] === "waiting") {

      this.position_body();


      // if the dog gave us the ball, change state to recognize that we have the ball
      if (this.dog_gave_me_ball === true) {
        this.state["state"] = "grabbing ball"

        return;
      }

      // if we need to walk then we change states
      if (this.wanted_position.x !== this.position.x) {
        this.state["state"] = "fetching";
        this.state["substate"] = "";

        return;
      }

      // if we have the ball - then we throw it in 3 seconds
      if (this.has_ball === true && this.state["substate"] === "") {
        setTimeout(() => {
          this.throwBall();
        }, 2000);

        this.state["waiting"];
        this.state["substate"] = "action queued";

        return;
      }

      // if we are stationary and have not made an action, then we decide to
      // move in a few seconds, and mark our waited decision
      if (this.state["substate"] === "") {
        setTimeout(() => {

          let num1 = Math.floor(Math.random() * this.game.width);
          let num2 = Math.floor(Math.random() * this.game.width);

          let avg = Math.floor((num1 + num2) / 2);

          this.wanted_position.x = avg;
          if (this.wanted_position.x < 0) {
            this.wanted_position.x = 0;
          }
          else if (this.wanted_position.x > this.game.width) {
            this.wanted_position.x = this.game.width;
          }
        }, Math.floor(Math.random() * 3000 + 3000));

        this.state["state"] = "waiting";
        this.state["substate"] = "action queued";
        return;
      }
    }

    if (this.state["state"] === "fetching") {
      // if headed to the right
      if (this.position.x < this.wanted_position.x) {
        this.position.x += 1;
        this.nudge = (this.nudge + this.nudge_direction);
        if (this.nudge >= 20) {
          this.nudge_direction = -1;
        }
        else if (this.nudge <= 0) {
          this.nudge_direction = 1;
        }
      }
      // if headed to the left
      else if (this.position.x > this.wanted_position.x) {
        this.position.x -= 1;
        this.nudge = this.nudge + this.nudge_direction;
        if (this.nudge >= 20) {
          this.nudge_direction = -1;
        }
        if (this.nudge <= 0) {
          this.nudge_direction = 1;
        }
      }
      // if at the target, but legs not stable
      else if (this.nudge !== 0) {
        if (this.nudge < 0) {
          this.nudge += 1;

        }
        else {
          this.nudge -= 1;
        }
      }
      // if in final position
      else {
        this.state["state"] = "waiting";
        this.state["substate"] = "";
      }

      this.position_body(this.nudge);

    }

    if (this.state["state"] === "throwing") {
      // cock_hand
      // throw ball
      // put hand back
      if (this.state["substate"] === "cocking") {

        // calculating some kind of angle based on the ball's vector
        let angle = Math.atan(Math.abs(this.ball.y_velocity) / Math.abs(this.ball.x_velocity) + 0.1);

        let delta_x = Math.abs(Math.cos(angle));
        let delta_y = Math.abs(Math.sin(angle));

        // move the hand in direction of the desired position
        this.move_throwing_hand(delta_x, delta_y);

        // if we reached the desired position we are now need to throw the ball
        if (this.left_hand.x == this.cocked_hand_pos.x && this.left_hand.y == this.cocked_hand_pos.y) {
          this.state["substate"] = "throwing";

          // here we set the end throw position to go to in the throwing substate
          let left_hand_x = this.pelvis.x - 10;
          let left_hand_y = this.pelvis.y;

          this.cocked_hand_pos.x = left_hand_x + (left_hand_x - this.cocked_hand_pos.x);
          this.cocked_hand_pos.y = left_hand_y + (left_hand_y - this.cocked_hand_pos.y);
        }

      }
      else if (this.state["substate"] === "throwing") {
        // calculating some kind of angle based on the ball's vector
        let angle = Math.atan(Math.abs(this.ball.y_velocity) / Math.abs(this.ball.x_velocity) + 0.1);

        let delta_x = Math.abs(Math.cos(angle));
        let delta_y = Math.abs(Math.sin(angle));

        // move the hand in direction of the desired position
        this.move_throwing_hand(delta_x, delta_y);

        // if we reach the thrown position
        if (this.left_hand.x == this.cocked_hand_pos.x && this.left_hand.y == this.cocked_hand_pos.y) {
          // let go of the ball and put it into the game environment
          this.has_ball = false;
          this.game.addComponent(this.ball);
          // now we calculate the next hand position and set the state to return hand
          this.state["substate"] = "return hand"
        }

      }
      else if (this.state["substate"] === "return hand") {
        // calculating some kind of angle based on the ball's vector
        let angle = Math.atan(Math.abs(this.ball.y_velocity) / Math.abs(this.ball.x_velocity) + 0.1);

        let delta_x = Math.abs(Math.cos(angle));
        let delta_y = Math.abs(Math.sin(angle));

        // move the hand in direction of the desired position
        this.move_throwing_hand(delta_x, delta_y);

        // if we reach the return hand position
        if (this.left_hand.x == this.cocked_hand_pos.x && this.left_hand.y == this.cocked_hand_pos.y) {
          this.state["state"] = "waiting";
          this.state["substate"] = "";
        }
      }
    }

    // if the ball is in our hand, update it to track our hand
    if (this.has_ball) {
      this.ball.x = this.left_hand.x;
      this.ball.y = this.left_hand.y;
    }
  }

  draw() {

    //settings
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "black";

    //draw head
    this.ctx.beginPath();
    this.ctx.arc(this.neck.x, this.neck.y - 10, 10, 0, 2 * Math.PI);
    this.ctx.stroke();

    //settings
    this.ctx.beginPath();

    // draw left leg
    this.ctx.moveTo(this.left_foot.x, this.left_foot.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw right leg
    this.ctx.moveTo(this.right_foot.x, this.right_foot.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw torso
    this.ctx.moveTo(this.neck.x, this.neck.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw left arm
    this.ctx.moveTo(this.left_hand.x, this.left_hand.y);
    this.ctx.lineTo(this.neck.x, this.neck.y);

    // draw right arm
    this.ctx.moveTo(this.right_hand.x, this.right_hand.y);
    this.ctx.lineTo(this.neck.x, this.neck.y);

    // settings
    this.ctx.stroke();

    // draw the ball
    if (this.has_ball == true) {
      this.ball.draw();
    }
  }

  throwBall() {
    // prepare a new throw trajectory
    this.setBallVelocity();

    // make sure always throwing up
    if (this.ball.y_velocity < 0) {
      this.ball.y_velocity *= -1;
    }

    let factor = 1;
    if (this.ball.x_velocity < 0) {
      factor = -1
    }

    this.ball.x_velocity = this.ball.x_velocity + 5 * factor;
    this.ball.y_velocity = this.ball.y_velocity + 20;

    // calculate an angle based on ball trajectory
    let angle = Math.atan(Math.abs(this.ball.y_velocity) / Math.abs(this.ball.x_velocity) + 0.1);

    let delta_x = Math.cos(angle) * 10;
    let delta_y = Math.sin(angle) * 10;

    if (this.ball.x_velocity < 0) {
      delta_x *= -1;
    }

    if (this.ball.x_velocity < 0) {
      delta_y *= -1;
    }

    // use the calculated angle to set where to cock back for the throw
    this.cocked_hand_pos.x = this.left_hand.x - delta_x;
    this.cocked_hand_pos.y = this.left_hand.y - delta_y;

    // change to the throwing - cocking back state to start throwing
    this.state["state"] = "throwing";
    this.state["substate"] = "cocking";
  }

  move_throwing_hand(delta_x, delta_y) {
    if (this.left_hand.x < this.cocked_hand_pos.x) {
      this.left_hand.x += delta_x;
      if (this.left_hand.x > this.cocked_hand_pos.x) {
        this.left_hand.x = this.cocked_hand_pos.x;
      }
    }
    else if (this.left_hand.x > this.cocked_hand_pos.x) {
      this.left_hand.x -= delta_x;
      if (this.left_hand.x < this.cocked_hand_pos.x) {
        this.left_hand.x = this.cocked_hand_pos.x;
      }
    }

    if (this.left_hand.y < this.cocked_hand_pos.y) {
      this.left_hand.y += delta_y;
      if (this.left_hand.y > this.cocked_hand_pos.y) {
        this.left_hand.y = this.cocked_hand_pos.y;
      }
    }
    else if (this.left_hand.y > this.cocked_hand_pos.y) {
      this.left_hand.y -= delta_y;
      if (this.left_hand.y < this.cocked_hand_pos.y) {
        this.left_hand.y = this.cocked_hand_pos.y;
      }
    }
  }

  position_body(nudge = 0) {
    this.pelvis.x = this.position.x;
    this.pelvis.y = this.position.y - 30;

    this.neck.x = this.pelvis.x;
    this.neck.y = this.pelvis.y - 20;

    this.left_foot.x = this.pelvis.x - 10 + nudge;
    this.left_foot.y = this.pelvis.y + 30;

    this.right_foot.x = this.pelvis.x + 10 - nudge;
    this.right_foot.y = this.pelvis.y + 30;

    this.left_hand.x = this.pelvis.x - 10 + nudge;
    this.left_hand.y = this.pelvis.y;

    this.right_hand.x = this.pelvis.x + 10 - nudge;
    this.right_hand.y = this.pelvis.y;
  }

  setBallVelocity() {
    this.ball.resetBallVelocity();

    if (this.position.x < this.game.width / 2) {
      this.ball.x_velocity = Math.abs(this.ball.x_velocity);
    }
    else {
      this.ball.x_velocity = Math.abs(this.ball.x_velocity) * -1;
    }
  }
}

class Dog {
  constructor(x, y, game) {
    this.name = "Dog"
    this.position = new Tuple(x, y);
    this.wanted_position = new Tuple(x, y);

    this.step_size = 20;

    this.vel = new Tuple(0, 0);

    this.direction = 1;

    this.neck = new Tuple(this.position.x + 10, this.position.y - 20);
    this.pelvis = new Tuple(this.neck.x - 10 * this.direction, this.neck.y);

    this.left_foot = new Tuple(this.pelvis.x - 10, this.pelvis.y + 20);
    this.right_foot = new Tuple(this.pelvis.x + 10, this.pelvis.y + 20);

    this.left_hand = new Tuple(this.neck.x - 10, this.neck.y);
    this.right_hand = new Tuple(this.neck.x + 10, this.neck.y);

    this.tail = new Tuple(this.pelvis.x + 5, this.pelvis.y - 10);

    this.nudge = 0;
    this.nudge_direction = 1;

    this.game = game;
    this.ctx = this.game.ctx;
    this.state = { "state": "spawned", "substate": "" };
    this.frame = 0;

    this.states = ["spawned", "waiting", "fetching"];

    this.ball = null;
    this.has_ball = false;

  }

  update() {
    // if you have a ball position it in your mouth
    if (this.has_ball === true) {
      this.ball.x = this.neck.x + 10 * this.direction;
      this.ball.y = this.left_hand.y;
    }
    // if you dont have a ball try and sense if one is in the environment
    // this should make you forget any balls once they disappear
    else {
      // are there any balls?
      let balls = this.game.getComponent("Ball");

      // if there are balls, notice one
      if (balls.length == 0) {
        this.ball = null;
      }
      else {
        this.ball = balls[0];
      }
    }

    // apply gravity
    this.vel.y += 0.5;
    this.position.y += this.vel.y;

    if (this.position.y > this.game.height) {
      this.position.y = this.game.height;
      this.vel.y = 0;
    }

    // spawned state
    // this transitions to the waiting state
    if (this.state["state"] === "spawned") {
      this.position_body();

      if (this.position.y === this.game.height) {
        this.state["state"] = "waiting";
        this.state["substate"] = "";
      }

      return;
    }

    // waiting state - this is where we decide what to do
    // waiting state goes to the fetching state
    if (this.state["state"] === "waiting") {


      this.position_body();

      // if no action has been taken
      if (this.state["substate"] === "") {
        // if you have the ball you need to give it back to the person
        if (this.has_ball === true) {
          let person = this.game.getComponent("Person")[0];
          this.wanted_position.x = person.position.x;

          this.state["state"] = "fetching";
          this.state["substate"] = "return ball"

          return;
        }

        // if you dont have the ball bit the ball can be seen go get it
        if (this.ball !== null) {
          this.wanted_position.x = this.ball.x;

          this.state["state"] = "fetching";
          this.state["substate"] = "get ball";

          return;
        }

        // if you dont have the ball and the ball can't be seen roam
        setTimeout(() => {
          let num1 = Math.floor(Math.random() * this.game.width);
          let num2 = Math.floor(Math.random() * this.game.width);

          let avg = Math.floor((num1 + num2) / 2);

          this.wanted_position.x = avg;

          this.state["state"] = "fetching";
          this.state["substate"] = "roam";
        }, Math.floor(Math.random() * 3000 + 1000));

        // go back to wait for roaming
        this.state["state"] = "waiting";
        this.state["substate"] = "action taken";

        return;
      }
    }

    // you either have the ball and want to give it to the owner,
    // you dont have the ball, but see it and want to catch it,
    // or you want to roam
    if (this.state["state"] === "fetching") {

      // if the ball is not in the world or held by the dog go to original desire
      if (this.vel.y == 0 && this.position.y == this.game.height) {
        this.vel.y -= 3;
      }
      // if headed to the right
      if (this.position.x < this.wanted_position.x) {
        this.direction = 1;
        this.position.x += 2;

        if (this.position.x > this.wanted_position.x) {
          this.position.x = this.wanted_position.x;
        }

        this.nudge = (this.nudge + this.nudge_direction);
        if (this.nudge >= 10) {
          this.nudge_direction = -1;
        }
        else if (this.nudge <= 0) {
          this.nudge_direction = 1;
        }
      }
      // if headed to the left
      else if (this.position.x > this.wanted_position.x) {
        this.direction = -1;
        this.position.x -= 2;

        if (this.position.x < this.wanted_position.x) {
          this.position.x = this.wanted_position.x;
        }

        this.nudge = this.nudge + this.nudge_direction;
        if (this.nudge >= 10) {
          this.nudge_direction = -1;
        }
        if (this.nudge <= 0) {
          this.nudge_direction = 1;
        }
      }
      // if at the target, but legs not stable
      else if (this.nudge !== 0) {
        if (this.nudge < 0) {
          this.nudge += 1;
          if (this.nudge > 0) {
            this.nudge = 0;
          }
        }
        else {
          this.nudge -= 1;
          if (this.nudge < 0) {
            this.nudge = 0;
          }
        }
      }
      // if in final position
      else {
        // if the ball is in the world
        if (this.state["substate"] === "get ball") {
          // if you reached the ball, pick it up - keep fetching to give it to person
          if (this.ball === null) {
            this.state["state"] = "waiting";
            this.state["substate"] = "";
          }
          else if (this.position.x === this.ball.x) {
            this.game.removeComponent("Ball");
            this.has_ball = true;
            this.state["state"] = "waiting";
            this.state["substate"] = "";
          }
          else {
            this.state["state"] = "waiting";
            this.state["substate"] = "";
          }
        }

        // if you have the ball and reached the person give it to them, then wait.
        else if (this.state["substate"] === "return ball") {
          let person = this.game.getComponent("Person")[0];
          if (this.position.x === person.position.x) {
            person.dog_gave_me_ball = true;

            this.has_ball = false;
            this.state["state"] = "waiting";
            this.state["substate"] = "";
          }
          else {
            this.state["state"] = "waiting";
            this.state["substate"] = "";
          }
        }

        // if you reached your desired location and there is no ball
        else if (this.state["substate"] === "roam") {
          this.state["state"] = "waiting";
          this.state["substate"] = "";
        }
      }

      this.position_body(this.nudge);
    }
  }

  draw() {

    //settings
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "black";

    //draw head
    this.ctx.beginPath();
    this.ctx.ellipse(this.neck.x + 10 * this.direction, this.neck.y - 8, 8 + 3 * this.direction, 8 + 3 * this.direction * -1, Math.PI / 4, 0, 2 * Math.PI);
    this.ctx.stroke();

    //settings
    this.ctx.beginPath();

    // draw tail
    this.ctx.moveTo(this.tail.x, this.tail.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw left leg
    this.ctx.moveTo(this.left_foot.x, this.left_foot.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw right leg
    this.ctx.moveTo(this.right_foot.x, this.right_foot.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw torso
    this.ctx.moveTo(this.neck.x, this.neck.y);
    this.ctx.lineTo(this.pelvis.x, this.pelvis.y);

    // draw left arm
    this.ctx.moveTo(this.left_hand.x, this.left_hand.y);
    this.ctx.lineTo(this.neck.x, this.neck.y);

    // draw right arm
    this.ctx.moveTo(this.right_hand.x, this.right_hand.y);
    this.ctx.lineTo(this.neck.x, this.neck.y);

    // settings
    this.ctx.stroke();

    // draw the ball
    if (this.ball !== null) {
      this.ball.draw();
    }
  }

  position_body(nudge = 0) {
    this.neck.x = this.position.x - 15 * this.direction;
    this.neck.y = this.position.y - 15;

    this.pelvis.x = this.neck.x - 30 * this.direction;
    this.pelvis.y = this.neck.y;

    this.left_foot.x = this.pelvis.x - 5 + nudge;
    this.left_foot.y = this.pelvis.y + 15;

    this.right_foot.x = this.pelvis.x + 5 - nudge;
    this.right_foot.y = this.pelvis.y + 15;

    this.left_hand.x = this.neck.x - 5 + nudge;
    this.left_hand.y = this.neck.y + 15;

    this.right_hand.x = this.neck.x + 5 - nudge;
    this.right_hand.y = this.neck.y + 15;

    this.tail.x = this.pelvis.x - 10 * this.direction;
    this.tail.y = this.pelvis.y - 10;

    if (this.has_ball === true) {
      this.ball.x = this.neck.x + 15 * this.direction;
      this.ball.y = this.neck.y;
    }
  }
}

class Tuple {
  constructor(x, y) {
    this.x = x;
    this.y = y;

  }
}

window.addEventListener("load", run);

function run() {

  const canvas = document.getElementById("tutorial");
  const ctx = canvas.getContext("2d");

  let game = new Game(canvas.width, canvas.height, 80, ctx);

  gen_num = () => {
    let num1 = Math.floor(Math.random() * game.width);
    let num2 = Math.floor(Math.random() * game.width);

    let avg = Math.floor((num1 + num2) / 2);
    return avg;
  }

  game.addComponent(
    new Person(gen_num(), 300, game));

  for (let i = 0; i < 3; i++) {
    game.addComponent(
      new Dog(gen_num(), 300, game));
  }

  game.gameLoop();
}


