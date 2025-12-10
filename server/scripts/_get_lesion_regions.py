import redpatch as rp
import sys
import skimage
from skimage import io, color

fs = rp.FilterSettings()
fs.read(sys.argv[3])

hsv_image = rp.load_as_hsv( str( sys.argv[1] ) )

lesion_area_mask, lesion_region_volume = rp.griffin_lesion_regions(hsv_image, h=fs['lesion_area']['h'], s=fs['lesion_area']['s'], v=fs['lesion_area']['v'])

img = skimage.img_as_ubyte(color.gray2rgb(lesion_area_mask))
io.imsave(sys.argv[2], img)