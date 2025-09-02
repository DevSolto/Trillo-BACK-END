import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Smoke (e2e)', () => {
  it('noop', () => {
    expect(true).toBe(true);
  });
});
