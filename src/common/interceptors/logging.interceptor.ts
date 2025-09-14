import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const req = http.getRequest<Request>()
    const res = http.getResponse<Response>()

    const start = Date.now()
    const requestId = this.ensureRequestId(req, res)

    const base = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: (req.headers['x-forwarded-for'] as string) || req.ip,
      user: (req as any)?.user?.id ?? null,
    }

    const requestLog = {
      ...base,
      type: 'request',
      headers: this.pickHeaders(req.headers),
      params: req.params,
      query: req.query,
      body: this.sanitizeBody(req.body),
    }

    this.logger.log(JSON.stringify(requestLog))

    return next.handle().pipe(
      tap((data) => {
        const ms = Date.now() - start
        const responseLog = {
          ...base,
          type: 'response',
          statusCode: res.statusCode,
          durationMs: ms,
          body: this.sanitizeBody(data),
        }
        this.logger.log(JSON.stringify(responseLog))
      }),
      catchError((err) => {
        const ms = Date.now() - start
        const statusCode = (err?.getStatus && err.getStatus()) || err?.status || 500
        const errorLog = {
          ...base,
          type: 'error',
          statusCode,
          durationMs: ms,
          error: this.sanitizeError(err),
        }
        this.logger.error(JSON.stringify(errorLog))
        return throwError(() => err)
      }),
    )
  }

  private ensureRequestId(req: Request, res: Response): string {
    let id = (req.headers['x-request-id'] as string) || ''
    if (!id) {
      id = this.randomId()
      res.setHeader('x-request-id', id)
    }
    ;(req as any).requestId = id
    return id
  }

  private randomId(): string {
    // Lightweight unique id (avoids bringing uuid dependency)
    return (
      Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10)
    )
  }

  private pickHeaders(headers: Record<string, any>) {
    const h: Record<string, any> = { ...headers }
    // Redact sensitive headers
    if (h.authorization) h.authorization = this.redact(h.authorization)
    if (h.cookie) h.cookie = this.redact(h.cookie)
    if (h['set-cookie']) h['set-cookie'] = this.redact(h['set-cookie'])
    return h
  }

  private sanitizeBody(body: any) {
    const redactKeys = new Set([
      'password',
      'currentPassword',
      'newPassword',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
    ])

    const seen = new WeakSet()

    const walk = (val: any): any => {
      if (val === null || val === undefined) return val
      if (typeof val === 'string') return this.truncate(val)
      if (typeof val !== 'object') return val
      if (seen.has(val)) return '[Circular]'
      seen.add(val)
      if (Array.isArray(val)) return val.map(walk)
      const out: Record<string, any> = {}
      for (const [k, v] of Object.entries(val)) {
        out[k] = redactKeys.has(k) ? this.redact(v) : walk(v)
      }
      return out
    }

    try {
      return walk(body)
    } catch {
      return '[Unserializable body]'
    }
  }

  private sanitizeError(err: any) {
    if (!err) return null
    return {
      name: err.name,
      message: err.message,
      // Avoid full stack in logs by default to keep noise down
      // stack: err.stack,
      response: this.sanitizeBody(err.response),
    }
  }

  private redact(_: any) {
    return '[REDACTED]'
  }

  private truncate(s: string, max = 2000) {
    return s.length > max ? s.substring(0, max) + `...(+${s.length - max} chars)` : s
  }
}

