# Adapted from https://github.com/ffont/push2-python/blob/884a3f06fdf4d78d0e99afc9a7cf6623bb7622d1/push2_python/display.py

import numpy

# Push 2 Display
DISPLAY_N_LINES = 160
DISPLAY_LINE_PIXELS = 960
DISPLAY_PIXEL_BYTES = 2  # bytes
DISPLAY_LINE_FILLER_BYTES = 128
DISPLAY_LINE_SIZE = DISPLAY_LINE_PIXELS * \
    DISPLAY_PIXEL_BYTES + DISPLAY_LINE_FILLER_BYTES
DISPLAY_N_LINES_PER_BUFFER = 8
DISPLAY_BUFFER_SIZE = DISPLAY_LINE_SIZE * DISPLAY_N_LINES_PER_BUFFER
DISPLAY_FRAME_XOR_PATTERN = [0xE7F3, 0xE7FF] * (
    ((DISPLAY_LINE_PIXELS + (DISPLAY_LINE_FILLER_BYTES // 2)) * DISPLAY_N_LINES) // 2)
FRAME_FORMAT_BGR565 = 'bgr565'
FRAME_FORMAT_RGB = 'rgb'
FRAME_FORMAT_IMAGEDATA = 'imagedata'

NP_DISPLAY_FRAME_XOR_PATTERN = numpy.array(DISPLAY_FRAME_XOR_PATTERN, dtype=numpy.uint16)  # Numpy array version of the constant

# Display code
def imagedata_to_bgr565(imagedata):
    array = imagedata.to_py()
    numpy_array = numpy.asarray(array)
    numpy_array = numpy.delete(numpy_array, slice(3, None, 4)) # Remove A values (every 4th value)
    numpy_array = numpy_array.reshape((DISPLAY_N_LINES,DISPLAY_LINE_PIXELS,3)) # Reshape to 960x160x3 
    return rgb_to_bgr565(numpy_array) # Convert format

# Non-vectorized function for converting from rgb to bgr565
def rgb_to_bgr565(rgb_frame):
    # rgb_frame *= 255
    rgb_frame_r = rgb_frame[:, :, 0].astype(numpy.uint16)
    rgb_frame_g = rgb_frame[:, :, 1].astype(numpy.uint16)
    rgb_frame_b = rgb_frame[:, :, 2].astype(numpy.uint16)
    frame_r_filtered = numpy.bitwise_and(rgb_frame_r, int('0000000011111000', 2))
    frame_r_shifted = numpy.right_shift(frame_r_filtered, 3)
    frame_g_filtered = numpy.bitwise_and(rgb_frame_g, int('0000000011111100', 2))
    frame_g_shifted = numpy.left_shift(frame_g_filtered, 3)
    frame_b_filtered = numpy.bitwise_and(rgb_frame_b, int('0000000011111000', 2))
    frame_b_shifted = numpy.left_shift(frame_b_filtered, 8)
    combined = frame_r_shifted + frame_g_shifted + frame_b_shifted  # Combine all channels
    return combined.transpose()


def prepare_frame(frame, input_format=FRAME_FORMAT_BGR565):
    """Prepare the given image frame to be shown in the Push2's display.
    Depending on the input_format argument, "frame" must be a numpy array with the following characteristics:

    * for FRAME_FORMAT_BGR565: numpy array of shape 910x160 and of uint16. Each uint16 element specifies rgb
        color with the following bit position meaning: [b4 b3 b2 b1 b0 g5 g4 g3 g2 g1 g0 r4 r3 r2 r1 r0].

    * for FRAME_FORMAT_RGB: numpy array of shape 910x160x3 with the third dimension representing rgb colors
        with separate float values for rgb channels (float values in range [0.0, 1.0]).
    
    * for FRAME_FORMAT_IMAGEDATA: numpy array with 910 * 160 * 4 items
        with separate int values for rgba channels (int values in range [0, 255]).

    Preferred format is brg565 as it requires no conversion before sending to Push2. Using brg565 is also very fast
    as color conversion is required but numpy handles it pretty well. You should be able to get frame rates higher than
    30 fps, depending on the speed of your computer. However, using the rgb format (FRAME_FORMAT_RGB) will result in very 
    long frame preparation times that can take seconds. This can be highgly optimized so it is as fast as the other formats
    but currently the library does not handle this format as nively. All numpy array elements are expected to be big endian.
    In addition to format conversion (if needed), "prepare_frame" prepares the frame to be sent to push by adding
    filler bytes and performing bitwise XOR as decribed in the Push2 specification.
    See https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#326-allocating-libusb-transfers
    """

    assert input_format in [FRAME_FORMAT_BGR565, FRAME_FORMAT_RGB, FRAME_FORMAT_IMAGEDATA], 'Invalid frame format'

    if input_format == FRAME_FORMAT_RGB:
        # If format is rgb, do conversion before the rest as frame must be reshaped
        # from (w, h, 3) to (w, h)
        frame = rgb_to_bgr565(frame)
    elif input_format == FRAME_FORMAT_IMAGEDATA:
        frame = imagedata_to_bgr565(frame)

    assert type(frame) == numpy.ndarray
    assert frame.dtype == numpy.dtype('uint16')
    assert frame.shape[0] == DISPLAY_LINE_PIXELS, 'Wrong number of pixels in line ({0})'.format(
        frame.shape[0])
    assert frame.shape[1] == DISPLAY_N_LINES, 'Wrong number of lines in frame ({0})'.format(
        frame.shape[1])

    width = DISPLAY_LINE_PIXELS + DISPLAY_LINE_FILLER_BYTES // 2
    height = DISPLAY_N_LINES
    prepared_frame = numpy.zeros(shape=(width, height), dtype=numpy.uint16)
    prepared_frame[0:frame.shape[0], 0:frame.shape[1]] = frame
    prepared_frame = prepared_frame.transpose().flatten()
    if input_format == FRAME_FORMAT_BGR565:
        pass  # Nothing to do as this is already the requested format
    elif input_format == FRAME_FORMAT_RGB:
        pass  # Nothing as conversion was done before
    prepared_frame = prepared_frame.byteswap()  # Change to little endian
    prepared_frame = numpy.bitwise_xor(prepared_frame, NP_DISPLAY_FRAME_XOR_PATTERN)

    return prepared_frame.byteswap().tobytes()


def prepare_black_frame():
    return prepare_frame(numpy.zeros((DISPLAY_LINE_PIXELS, DISPLAY_N_LINES), dtype=numpy.uint16))