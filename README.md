

# To do

- remove tail from linked list (there's no need for it)
- fix the nearest n when considering neighbors?
- along with the proposal above, also adjust grid based on how many particles are being simulated, so we can scale
  (otherwise, as the density increases, grid cells would contain more and more particles)
- at the press of a key, select a particle randomly and show its neighbors (for debugging purposes)
- show stats for each cell (index and num of particles)
- paint particles according to their current cell (would detected particles out of their respective cells)
- press spacebar to introduce a batch of particles, all travelling at the same speed and heading
  (alternatively, each spacebar press would introduce a single one, and the user could press it several times to create
   a stream of particles)
- add energy loss (heat?) when particles travel (and maybe when then collide)
- particles should not cross each other under any circumstances (an infinite repelling force would prevent that)
