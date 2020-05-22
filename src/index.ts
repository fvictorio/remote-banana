type RemoteStatusSuccess<T> = { _type: 'success'; data: T }
type RemoteStatus<T> =
  | { _type: 'notAsked' }
  | RemoteStatusSuccess<T>
  | { _type: 'loading' }
  | { _type: 'failure'; error: Error }

function success<T>(data: T): RemoteStatusSuccess<T> {
  return {
    _type: 'success',
    data,
  }
}

function loading<T>(): RemoteStatus<T> {
  return {
    _type: 'loading',
  }
}

function notAsked<T>(): RemoteStatus<T> {
  return {
    _type: 'notAsked',
  }
}

export class Remote<T> {
  protected status: RemoteStatus<T>

  protected constructor(status?: RemoteStatus<T>) {
    this.status = status || notAsked()
  }

  public hasData(): this is RemoteWithData<T> {
    return this.status._type === 'success'
  }

  public match<U>({
    onSuccess,
    onLoading,
    onNotAsked,
    onFailure,
  }: {
    onSuccess: ((data: T) => U) | U
    onLoading: (() => U) | U
    onNotAsked: (() => U) | U
    onFailure: ((e: Error) => U) | U
  }): U {
    if (this.status._type === 'notAsked') {
      return onNotAsked instanceof Function ? onNotAsked() : onNotAsked
    }
    if (this.status._type === 'success') {
      return onSuccess instanceof Function
        ? onSuccess(this.status.data)
        : onSuccess
    }
    if (this.status._type === 'loading') {
      return onLoading instanceof Function ? onLoading() : onLoading
    }
    if (this.status._type === 'failure') {
      return onFailure instanceof Function
        ? onFailure(this.status.error)
        : onFailure
    }

    const exhaustiveCheck: never = this.status
    return exhaustiveCheck
  }

  public get(): T | null {
    return this.status._type === 'success' ? this.status.data : null
  }

  public isLoading(): boolean {
    return this.status._type === 'loading'
  }

  public getOr(defaultData: T): T {
    return this.get() || defaultData
  }

  static success<T>(data: T): Remote<T> {
    return new Remote(success(data))
  }

  static notAsked<T>(): Remote<T> {
    return new Remote()
  }

  static loading<T>(): Remote<T> {
    return new Remote(loading())
  }
}

class RemoteWithData<T> extends Remote<T> {
  protected status: RemoteStatusSuccess<T>
  constructor(data: T) {
    super(success(data))
  }
}
