#!/usr/bin/env python

"""Authors: Jakub Liput
Copyright (C) 2020 ACK CYFRONET AGH
This software is released under the MIT license cited in 'LICENSE.txt'

Removes query string that forces font files to be fetched without cache.
The query string is added by Icomoon Generator and there is no option there to disable it.
This script should be used on every oneicons update.
"""

import re
import os

THIS_DIR = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(THIS_DIR, '../public/assets/fonts/oneicons/style.scss'), 'r+' ) as f:
  content = f.read()
  content_new = re.sub(r"(url.*\.\w+)(\?.*?)(['#].*format.*)", r'\1\3', content, flags = re.M)
  f.seek(0)
  f.write(content_new)
  f.truncate()
