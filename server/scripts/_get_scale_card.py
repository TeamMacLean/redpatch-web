import redpatch as rp
import sys
from scipy import ndimage as ndi
import skimage
from skimage import io, color

fs = rp.FilterSettings()
fs.read(sys.argv[3])

hsv_image = rp.load_as_hsv( str( sys.argv[1] ) )

scale_card = rp.threshold_hsv_img(hsv_image, h=fs['scale_card']['h'],s=fs['scale_card']['s'],v=fs['scale_card']['v'])
mask = ndi.binary_fill_holes(scale_card)
img = skimage.img_as_ubyte(color.gray2rgb(mask))

io.imsave(sys.argv[2], img)