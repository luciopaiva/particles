

# To do

- gravity
- toogle force mode:
  1. inverse gravitation force (inversely proportional to the square distance between each pair of particles)
  2. nearby springs (find nearest n, calculate average distance d and use it as a the rest length of a spring between
     the particle and each of the n neighbors)
- fix the nearest n when considering neighbors?
- along with the proposal above, also adjust grid based on how many particles are being simulated, so we can scale
  (otherwise, as the density increases, grid cells would contain more and more particles)
- show stats for each cell (index and num of particles)
- press spacebar to introduce a batch of particles, all travelling at the same speed and heading
  (alternatively, each spacebar press would introduce a single one, and the user could press it several times to create
   a stream of particles)
- add energy loss (heat?) when particles travel (and maybe when then collide)
