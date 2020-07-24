import redpatch as rp
import sys
import skimage
from skimage import io, color

fs = rp.FilterSettings()
fs.read(sys.argv[3])

hsv_image = rp.load_as_hsv( str( sys.argv[1] ) )

healthy_mask, healthy_volume = rp.griffin_healthy_regions(hsv_image, h=fs['healthy_area']['h'], s=fs['healthy_area']['s'], v=fs['healthy_area']['v'])

img = skimage.img_as_ubyte(color.gray2rgb(healthy_mask))
io.imsave(sys.argv[2], img)