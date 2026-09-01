<?php

namespace App\Support;

use RuntimeException;

/** A merge that could not be done, with a message meant for the person asking. */
class DocumentMergeException extends RuntimeException {}
