% Prototyping An Actor In Java


I have always try to implement an actor like the ones of Erlang or Scala in java, and had tried several times with different strategies. The former attempts seems naive, and I will not demonstrate it here, but the ideas from those naive prototypes still hold.
Note

<pre>
    * I hope you know something about the actor model before continuing to read this.
    * We mainly focus on "fire-and-get" pattern, the "fire-and-forget" pattern is much easier to implement.
    * To simply the prototyping process, I will left any generic type design behind, hope u can polish it so that it can be your own tools.
</pre>

Before start, we need to make something clear. In Java, the concurrency is modeled in Task-Based Concurrency, We run different logic which is modeled as tasks to run in parallel. But The actor is different, it belongs to the category of Data-Based Concurrency, to bridge the differences between this two concurrency models, I will declare an interface to confine the process logic into it:

~~~~~~~ {.java}
public interface ActorClosure<T> extends Runnable {
     void sinkEvent(T event);
}
~~~~~~~
  
ActorClosure will accept different events each time but run them one by one with same process logic. That's why a sinkeEvent() method is declared.

Besides, we also give out an stub for our demonstration:

~~~~~~~ {.java}
public class ActorClosureStub implements ActorClosure<String> {
    private String event;
    
    public void run() {
        try {
            TimeUnit.SECONDS.sleep(5);
        } catch (InterruptedException e) {
         // log the exception
            return;
        }
        System.out.println("received event:" + event);
    }
    public void sinkEvent(String event) {
        this.event = event;
    }
}
~~~~~~~

  
OK, background is done, let's start with our java actor prototyping play...

# Actor with Same Instance Reference of Action(Failed)

Since each event that send to the actor should be processed by one processing logic, At first, we will just let our actor to use only one ActorClosure to process all of the events that's sent to it. So below is the code :

~~~~~~~ {.java}
public class FailedActorWithSameReference {

    private ExecutorService      scheduler = Executors.newFixedThreadPool(1);
    private ActorClosure<String> action    = new ActorClosureStub();

    public Future<?> bang(String event) throws InterruptedException {
        action.sinkEvent(event);
        return scheduler.submit(action, null);
    }

    public void terminate() {
        scheduler.shutdown();
    }

    public static void main(String[] args) throws Exception {
        FailedActorWithSameReference actor = new FailedActorWithSameReference();
        Future<?> f1 = actor.bang("a");
        Future<?> f2 = actor.bang("b");
        f1.get();
        f2.get();
        actor.terminate();
    }
}
~~~~~~~


   
In fact, no need to run this piece of code, we can see that it won't work properly, why? Because we didn't handle the concurrency operation on the ActorClosure properly, the latter bang(!) will replace or corrupt the state in the ActorClosure, If you run the above piece of code, it will print "b" twice, but we do expect "a" and "b" in sequence. But the problem really is the bad concurrency control on ActorClosure? No, If we add concurrency control on ActorClosure, then we go wrong way in the process of modeling an actor.

So, no concurrency control on ActorClosure, how to avoid the state corruption?

# Actor With Prototype Scope Action(Workable)

We of course can allocate a new ActorClosure instance for each event, in this way, the state of ActorClosures and their events will be confined into their own boundary without leak and interference.

With this in mind, we got code piece below:

~~~~~~~ {.java}
/**
 * This actor implementation just simply works, but it can't fully simulate the
 * exact behavior of an actor, e.g. since we will create new action closure for
 * each event, the states of the action closure can't be kept in the time-line
 * of the actor, maybe we should introduce some copy mechanism to complement
 * this.
 * 
 * @author fujohnwang
 * @since 1.0
 */
public class ActorWithPrototypeScopeActionClosure {

    private ExecutorService                       scheduler  = Executors.newFixedThreadPool(1);

    private Class<? extends ActorClosure<String>> actionType = ActorClosureStub.class;

    public Future<?> bang(String e) throws Exception {
        ActorClosure<String> action = actionType.newInstance();
        action.sinkEvent(e);
        return scheduler.submit(action, null);
    }

    public void setActionType(Class<? extends ActorClosure<String>> actionType) {
        this.actionType = actionType;
    }

    public Class<? extends ActorClosure<String>> getActionType() {
        return actionType;
    }

    public void terminate() {
        scheduler.shutdown();
    }

    public static void main(String[] args) throws Exception {
        ActorWithPrototypeScopeActionClosure actor = new ActorWithPrototypeScopeActionClosure();
        Future<?> f1 = actor.bang("a");
        Future<?> f2 = actor.bang("b");
        Future<?> f3 = actor.bang("c");

        f3.get();
        f2.get();
        f1.get();

        actor.terminate();
    }
}
~~~~~~~

   
If we run the above piece of code, the result will be as we expected. Seems it work, but wait, it's not perfect. Why? (Why again ha?)
Since we wrap each event(the data) into a ActorClosureStub instance(the task), we lost the smooth timeline state of the processsing. Simply put, the ActorClosureStub runs first has no correlation with other ActorClosureStubs. But in actor's semantics, they should be one. So although this prototyping seems work, but it still have improvement space.

# Actor With State Copy Between Prototype Scope Actions

So I hope to copy the state between each ActorClosure after they run, in this way, the 1st ActorClosure will pass its state to the 2nd ActorClosure before the 2nd ActorClosure will run, and the 2nd ActorClosure will pass its state to the 3rd ActorClosure before the 3rd ActorClosure will run, and so on.

To make this happen, we can recall the hooks the ThreadPoolExecutor has, e.g. afterExecute(), beforeExecute(), furthermore, we can even directly override the execute() of it. Anyway, we can write such-alike code:

~~~~~~~ {.java}
/**
 * Although we seek to extend {@link ActorWithPrototypeScopeActionClosure} to
 * enable state copy between the action closures, BUT it seems that the Executor
 * implementation doesn't allow us to go this way.<br>
 * This Actor DOESN'T Work!!!!
 * 
 * @author fujohnwang
 * @since 1.0
 */
public class ActorWithStateCopy {

    private ActorClosure<String>                           lastClosure;
    private ActionClosureStateCopier<ActorClosure<String>> stateCopier = new ActionClosureStateCopier<ActorClosure<String>>() {
                                                                           public void copy(ActorClosure<String> from,
                                                                                            ActorClosure<String> to) {
                                                                               System.out
                                                                                       .println("do copy if necessary");
                                                                           }

                                                                       };

    private ExecutorService                                scheduler   = new ThreadPoolExecutor(
                                                                               1,
                                                                               1,
                                                                               60,
                                                                               TimeUnit.SECONDS,
                                                                               new ArrayBlockingQueue<Runnable>(
                                                                                       10)) {

//                                                                           @Override
//                                                                           protected void afterExecute(Runnable arg0,
//                                                                                                       Throwable arg1) {
//                                                                               super.afterExecute(
//                                                                                       arg0, arg1);
//                                                                           }
//
//                                                                           @Override
//                                                                           protected void beforeExecute(Thread arg0,
//                                                                                                        Runnable arg1) {
//                                                                               super.beforeExecute(
//                                                                                       arg0, arg1);
//                                                                           }

                                                                           @SuppressWarnings("unchecked")
                                                                           @Override
                                                                           public void execute(Runnable command) {
                                                                               ActorClosure<String> r = (ActorClosure<String>) command;
                                                                               if (lastClosure != null
                                                                                       && stateCopier != null) {
                                                                                   System.out
                                                                                           .println("copy state before executing");
                                                                                   stateCopier
                                                                                           .copy(lastClosure,
                                                                                                   r);
                                                                               }
                                                                               super.execute(r);

                                                                               lastClosure = r;
                                                                           }

                                                                       };

    private Class<? extends ActorClosure<String>>          actionType  = ActorClosureStub.class;

    public Future<?> bang(String e) throws Exception {
        ActorClosure<String> action = actionType.newInstance();
        action.sinkEvent(e);
        return scheduler.submit(action, null);
    }

    public void setActionType(Class<? extends ActorClosure<String>> actionType) {
        this.actionType = actionType;
    }

    public Class<? extends ActorClosure<String>> getActionType() {
        return actionType;
    }

    public void terminate() {
        scheduler.shutdown();
    }

    /**
     * @param args
     */
    public static void main(String[] args) throws Exception {
        ActorWithStateCopy actor = new ActorWithStateCopy();
        Future<?> f1 = actor.bang("a");
        Future<?> f2 = actor.bang("b");
        Future<?> f3 = actor.bang("c");

        f3.get();
        f2.get();
        f1.get();

        actor.terminate();
    }

}
~~~~~~~


   
Let's run the code. Oops, something goes wrong:


~~~~~~~ {.java}
Exception in thread "main" java.lang.ClassCastException: java.util.concurrent.FutureTask cannot be cast to cn.spring21.sandbox.actor.ActorClosure
 at cn.spring21.sandbox.actor.ActorWithStateCopy$2.execute(ActorWithStateCopy.java:55)
 at java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:85)
 at cn.spring21.sandbox.actor.ActorWithStateCopy.bang(ActorWithStateCopy.java:76)
 at cn.spring21.sandbox.actor.ActorWithStateCopy.main(ActorWithStateCopy.java:96) 

~~~~~~~
   
   
See the problem? Wow, ThreadPoolExecutor really do some dirty things there, and I tries to bypass it but finally, I found I couldn't :-(

# Raw Thread Based Actor Prototyping (Workable)

I fall back to a raw thread solution for the actor. The final code is listed here:

~~~~~~~ {.java}
public class ImprovedThreadBasedActor<T> extends Thread {

    private static final Logger            logger  = LoggerFactory
                                                           .getLogger(ImprovedThreadBasedActor.class);

    private BlockingQueue<EventWrapper<T>> mailbox;
    private volatile boolean               running = true;
    private ActorClosure<T>                action;

    public ImprovedThreadBasedActor(ActorClosure<T> action) {
        this(action, 100);
    }

    public ImprovedThreadBasedActor(ActorClosure<T> action, int mailboxSize) {
        Validate.notNull(action);

        mailbox = new ArrayBlockingQueue<EventWrapper<T>>(mailboxSize <= 0 ? 100 : mailboxSize);
        this.action = action;

    }

    public Future<?> sendAndAsyncWait(T event) throws Exception {
        if (!running) {
            throw new Exception("the actor is down");
        }
        FutureTask<Object> future = new FutureTask<Object>(new Runnable() {
            public void run() {
            }
        }, true);
        EventWrapper<T> wrapper = new EventWrapper<T>(event, future);
        mailbox.put(wrapper);
        return future;
    }

    @Override
    public void run() {
        while (running) {
            try {
                EventWrapper<T> wrapper = mailbox.take();
                try {
                    action.sinkEvent(wrapper.getEvent());
                    action.run();
                    wrapper.getFuture().run();
                } catch (Exception e) {
                    logger.error("exception in actor execution which will stop the actor:\n{}",
                            ExceptionUtils.getFullStackTrace(e));
                    break;
                }
            } catch (InterruptedException e) {
                logger.info("ImprovedThreadBasedActor running thread is interrupted:{}",
                        ExceptionUtils.getFullStackTrace(e));
                continue;
            }
        }
        logger.info("ImprovedThreadBasedActor is down.");
    }

    public void terminate() {
        running = false;
        interrupt();
    }

    public static void main(String[] args) throws Exception {
        ImprovedThreadBasedActor<String> actor = new ImprovedThreadBasedActor<String>(
                new ActorClosureStub(), 10);
        actor.start();

        Future<?> f1 = actor.sendAndAsyncWait("a");
        Future<?> f2 = actor.sendAndAsyncWait("b");
        Future<?> f3 = actor.sendAndAsyncWait("c");
        f3.get();
        System.out.println("f2 is done? " + f2.isDone());
        f2.get();
        System.out.println("f1 is done? " + f2.isDone());
        f1.get();
        System.out.println("stop the actor.");
        actor.terminate();
    }
}
~~~~~~~



   
No explanation on this, you can explore it yourself. There are several tricky things in the code, I hope you can figure out the reason. GL and HF.

## Another Version


~~~~~~~ {.java}
/**
 * This is a heavy weight thread based actor implementation.<br>
 * 
 * @author fujohnwang
 * @param <T>, the event type to be processed
 * @param <R>, result type after processing the event.
 */
public class ThreadActor<T, R> extends Thread {
    private transient final Logger            logger  = LoggerFactory.getLogger(this.getClass());

    private volatile boolean                  running = true;
    private BlockingQueue<EventWrapper<T, R>> mailbox;
    private Reaction<T, R>                    action;

    public ThreadActor(Reaction<T, R> action, int mailboxSize) {
        this.action = action;
        this.mailbox = new ArrayBlockingQueue<EventWrapper<T, R>>((mailboxSize <= 0) ? 100
                : mailboxSize);
    }

    public Future<R> sendAndAsycAwait(T event) throws Exception {
        if (!running) {
            throw new Exception("the actor is down");
        }
        FutureProxy<R> f = new FutureProxy<R>(new FutureTask<R>(new Callable<R>() {
            public R call() throws Exception {
                return null;
            }
        }));
        mailbox.put(new EventWrapper<T, R>(event, f));
        return f;
    }

    @Override
    public void run() {
        while (running) {
            try {
                EventWrapper<T, R> e = mailbox.take();
                action.sink(e.getEvent());
                try {
                    R r = action.call();
                    e.getFuture().setResult(r);
                } catch (Exception e1) {
                    e.getFuture().setCause(e1);
                } finally {
                    e.getFuture().getDelegate().run();
                }
            } catch (InterruptedException e) {
                continue;
            }
        }
        logger.info("actor shutdown");
    }

    public void terminate() {
        running = false;
        interrupt();
    }

    public static void main(String args[]) {
        ThreadActor<String, Boolean> actor = new ThreadActor<String, Boolean>(new ReactionStub(),
                10);
        actor.start();

        try {
            for (int i = 0; i < 10; i++) {
                try {
                    System.out.println(actor.sendAndAsycAwait(String.valueOf(i)).get());
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (ExecutionException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        } finally {
            actor.terminate();
        }
    }
}

class ReactionStub implements Reaction<String, Boolean> {

    private long   counter;
    private String event;

    public Boolean call() throws Exception {
        try {
            if (counter % 2 == 0) {
                System.out.println("message received:" + event);
                return true;
            } else {
                throw new Exception("sample exception");
            }
        } finally {
            counter += 1;
        }

    }

    public void sink(String event) {
        this.event = event;
    }

}
~~~~~~~

    
优劣不解释。

# Conclusion

The above words just a play-around, don't treat it too serious. It's not rocket science, If you are looking for such thing, get away. These words are not for you.

**Caution: The last method still has gotchas, Improvement is still in progress**