/*
    sweet alerts
    https://sweetalert2.github.io/
*/
//Sweet alert
import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11.19.1/+esm";
const swalWithConfirm = Swal.mixin({
  _onConfirm : null
})

export {Swal};

export const EnterScene = (data, noEscape = true) => {
  let _scene = typeof data == "string" ? Scenes[data] : data;
  //dont allow outside clicks to close
  let scene = noEscape
    ? Object.assign(_scene, {
        allowOutsideClick: false,
        allowEscapeKey: false
      })
    : _scene;

  //show scene
  swalWithConfirm.fire(scene).then((res) => {
    //monitor for result
    if (scene._onConfirm && res.isConfirmed) {
      typeof scene._onConfirm == "function"
        ? scene._onConfirm(scene)
        : GoToScene(scene._onConfirm);
    }
  });
};

const Scenes = {
  Intro: {
    title: `Welcome to the Outlands!`,
    text: `This is a game of exploration. You are the blue diamond. Click on the map to move from place to place. At any time you can explore where you are.`,
    footer: `
      <div>Maps are created by <a href="https://watabou.github.io/realm.html">Perilous Shores</a> by Watabou.</div>
      <div>The cozy exploration game was inspired by <a href="https://sleepysasquatch.itch.io/glide">Glide</a> by Sleepy Sasquatch Games.</div>`,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Next",
    _onConfirm : "Intro2"
  },
  Intro2: {
    text: `You gain points by exploring. You will find new routes, resources, people, ruins... But every time you move or explore it takes time. Exploring isn't easy - you can face setbacks, and get hurt. All of which takes more time. And if you get hurt badly enough, your exploration days will be over ☠.`,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Next",
    _onConfirm : "Intro3"
  },
  Intro3: {
    text: `The game will reset every week. How many points can you get? How many points in the least amount of time?`,
    footer : `Good luck brave explorer!`,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Explore!",
  }
};
