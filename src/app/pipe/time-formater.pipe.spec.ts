import { TimeFormaterPipe } from '../time-formater.pipe';

describe('TimeFormaterPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeFormaterPipe();
    expect(pipe).toBeTruthy();
  });
});
