export const STAGE_WIDTH = 12;
export const STAGE_HEIGHT = 20;

export const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () => Array(STAGE_WIDTH).fill([0, 'clear']));

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
 

  // To use loops to be able to return and break
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // This checks we are in the correct cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // This checks the move is being done inside the height (y)
          // That we're not go through bottom of the play area
          !stage[y + player.pos.y + moveY] ||
          // This checks the moves done are inside the game areas width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // This checks that the cell we are moving are not set to clear
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
            'clear'
        ) {
          return true;
        }
      }
    }
  }
  // 5. If everything above is false
  return false;
};
