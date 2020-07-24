import redpatch as rp
import sys
import skimage
from skimage import io, color

fs = rp.FilterSettings()
fs.read(sys.argv[3])

hsv_image = rp.load_as_hsv( str( sys.argv[1] ) )

leaf_area_mask = rp.griffin_leaf_regions(hsv_image, h=fs['leaf_area']['h'], s=fs['leaf_area']['s'], v=fs['leaf_area']['v'])

img = skimage.img_as_ubyte(color.gray2rgb(leaf_area_mask))
io.imsave(sys.argv[2], img)