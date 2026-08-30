<?php

namespace Tests;

use App\Support\WorkflowStep;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // WorkflowStep caches each workspace's steps for the life of the
        // process. One request is exactly the right scope for that; a test run
        // is not - workspace ids repeat, so without this a test would read the
        // previous one's workflow.
        WorkflowStep::flush();
    }
}
